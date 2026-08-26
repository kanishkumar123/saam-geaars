import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { usePageTitle, useAdminUI } from "../context/AdminUIContext";
import Dropdown from "../components/Dropdown";
import DatePicker from "../components/DatePicker";
import { SkeletonRows } from "../components/Skeleton";
import { cardStyle, labelStyle, thStyle, tdStyle } from "../components/masters/adminUiStyles";

const ACTION_LABELS = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  stage_status_change: "Stage status changed",
  stock_adjustment: "Stock adjusted",
};

const ACTION_COLORS = {
  create: "var(--a-success)",
  update: "var(--a-brand)",
  delete: "var(--a-danger)",
  stage_status_change: "#0d9488",
  stock_adjustment: "#d97706",
};

const ENTITY_LABELS = {
  company: "Company",
  project: "Purchase order",
  task: "Task",
  raw_material: "Raw material",
  supplier_order: "Supplier order",
  process_template: "Process template",
  job_card: "Job card",
  job_card_stage: "Job card stage",
  user: "User",
};

const MAX_ROWS = 500;

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// Which lookup table resolves a given "*_id" field, and the column to
// display from it — lets RecordFields/ValueDiff show a name instead of a
// raw UUID for the id fields that show up most often in audit payloads.
const ID_FIELD_LOOKUPS = {
  actor_id: ["users", "label"],
  created_by: ["users", "label"],
  updated_by: ["users", "label"],
  company_id: ["companies", "name"],
  project_id: ["projects", "po_number"],
  task_id: ["tasks", "part_number"],
  raw_material_id: ["materials", "name"],
  process_template_id: ["templates", "name"],
};

export default function AuditLog() {
  usePageTitle("Audit log");
  const { searchQuery } = useAdminUI();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [lookups, setLookups] = useState({});
  const [actorFilter, setActorFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, username, full_name")
      .order("username")
      .then(({ data }) => setUsers(data || []));

    (async () => {
      const [companies, projects, tasks, materials, templates] = await Promise.all([
        supabase.from("companies").select("id, name"),
        supabase.from("projects").select("id, po_number"),
        supabase.from("tasks").select("id, part_number"),
        supabase.from("raw_materials").select("id, name"),
        supabase.from("process_templates").select("id, name"),
      ]);
      const toMap = (rows, col) => Object.fromEntries((rows || []).map((r) => [r.id, r[col]]));
      setLookups({
        companies: toMap(companies.data, "name"),
        projects: toMap(projects.data, "po_number"),
        tasks: toMap(tasks.data, "part_number"),
        materials: toMap(materials.data, "name"),
        templates: toMap(templates.data, "name"),
      });
    })();
  }, []);

  // "users" resolves via label (username || full_name), so it's built
  // separately from the plain id -> column lookups above.
  const usersLookup = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u.username || u.full_name || u.id])),
    [users],
  );
  const allLookups = useMemo(() => ({ ...lookups, users: usersLookup }), [lookups, usersLookup]);

  async function load(query) {
    setLoading(true);
    let q = supabase
      .from("audit_log")
      .select("*, actor:profiles(username, full_name, email)")
      .order("created_at", { ascending: false })
      .limit(MAX_ROWS);
    if (actorFilter) q = q.eq("actor_id", actorFilter);
    if (actionFilter) q = q.eq("action", actionFilter);
    if (entityFilter) q = q.eq("entity_type", entityFilter);
    if (dateFrom) q = q.gte("created_at", `${dateFrom}T00:00:00`);
    if (dateTo) q = q.lte("created_at", `${dateTo}T23:59:59`);
    if (query.trim()) q = q.ilike("summary", `%${query.trim()}%`);
    const { data } = await q;
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load(searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actorFilter, actionFilter, entityFilter, dateFrom, dateTo]);

  // Same StrictMode-safe guard used elsewhere: compares against the last
  // loaded value instead of a one-shot boolean, so it survives React's
  // mount-time effect replay without firing a redundant duplicate load.
  const lastLoadedSearch = useRef(searchQuery);
  useEffect(() => {
    if (lastLoadedSearch.current === searchQuery) return;
    lastLoadedSearch.current = searchQuery;
    const timer = setTimeout(() => load(searchQuery), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const userOptions = useMemo(
    () => [{ value: "", label: "All users" }, ...users.map((u) => ({ value: u.id, label: u.username || u.full_name || u.id }))],
    [users],
  );
  const actionOptions = useMemo(
    () => [{ value: "", label: "All actions" }, ...Object.entries(ACTION_LABELS).map(([value, label]) => ({ value, label }))],
    [],
  );
  const entityOptions = useMemo(
    () => [{ value: "", label: "All records" }, ...Object.entries(ENTITY_LABELS).map(([value, label]) => ({ value, label }))],
    [],
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "1.25rem" }}>
        <div>
          <label style={labelStyle}>User</label>
          <Dropdown value={actorFilter} onChange={setActorFilter} options={userOptions} />
        </div>
        <div>
          <label style={labelStyle}>Action</label>
          <Dropdown value={actionFilter} onChange={setActionFilter} options={actionOptions} />
        </div>
        <div>
          <label style={labelStyle}>Record type</label>
          <Dropdown value={entityFilter} onChange={setEntityFilter} options={entityOptions} />
        </div>
        <div>
          <label style={labelStyle}>From</label>
          <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="Any" />
        </div>
        <div>
          <label style={labelStyle}>To</label>
          <DatePicker value={dateTo} onChange={setDateTo} placeholder="Any" />
        </div>
      </div>

      <div style={{ ...cardStyle, overflow: "auto" }}>
        {loading ? (
          <SkeletonRows columns={5} />
        ) : rows.length === 0 ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--a-text-3)" }}>No audit entries match these filters.</div>
        ) : (
          <table style={{ width: "100%", minWidth: "760px", borderCollapse: "collapse", fontSize: "14.5px" }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: "34px" }}></th>
                <th style={thStyle}>When</th>
                <th style={thStyle}>Who</th>
                <th style={thStyle}>Action</th>
                <th style={thStyle}>Record</th>
                <th style={thStyle}>Summary</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isExpanded = expandedId === r.id;
                const hasDetail = r.old_values || r.new_values || r.remarks || r.from_status || r.to_status;
                return (
                  <Fragment key={r.id}>
                    <tr
                      className="admin-table-row"
                      style={{ cursor: hasDetail ? "pointer" : "default" }}
                      onClick={() => hasDetail && setExpandedId(isExpanded ? null : r.id)}
                    >
                      <td style={tdStyle}>
                        {hasDetail && (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: "nowrap", color: "var(--a-text-3)" }}>{formatDateTime(r.created_at)}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{r.actor?.username || r.actor?.full_name || r.actor?.email || "—"}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: "999px",
                            color: ACTION_COLORS[r.action] || "var(--a-text-2)",
                            background: `color-mix(in srgb, ${ACTION_COLORS[r.action] || "var(--a-text-2)"} 14%, transparent)`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ACTION_LABELS[r.action] || r.action}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: "nowrap", color: "var(--a-text-2)" }}>{ENTITY_LABELS[r.entity_type] || r.entity_type}</td>
                      <td style={{ ...tdStyle, maxWidth: "360px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.summary}</td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} style={{ ...tdStyle, background: "var(--a-bg-elevated)" }}>
                          <AuditDetail row={r} lookups={allLookups} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {!loading && rows.length === MAX_ROWS && (
        <div style={{ marginTop: "10px", fontSize: "13px", color: "var(--a-text-3)" }}>
          Showing the most recent {MAX_ROWS} matching entries — narrow the filters to see older activity.
        </div>
      )}
      <style>{`.admin-table-row:hover { background: var(--a-bg-elevated); }`}</style>
    </div>
  );
}

function AuditDetail({ row, lookups }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13.5px", padding: "4px 0" }}>
      {row.stage_type && (
        <div>
          <strong>Stage:</strong> {row.stage_type}
          {row.from_status && row.to_status && (
            <>
              {" — "}
              {row.from_status} <ChevronRight size={11} style={{ verticalAlign: "middle" }} /> {row.to_status}
            </>
          )}
        </div>
      )}
      {row.remarks && (
        <div>
          <strong>Remarks:</strong> {row.remarks}
        </div>
      )}
      {row.new_values?.delta !== undefined && (
        <div>
          <strong>Stock change:</strong> {row.new_values.delta > 0 ? "+" : ""}
          {row.new_values.delta} ({row.new_values.reason}) — resulting stock: {row.new_values.resulting_stock}
        </div>
      )}
      {row.old_values && row.action === "update" && !row.stage_type && (
        <ValueDiff oldValues={row.old_values} newValues={row.new_values} lookups={lookups} />
      )}
      {row.action === "delete" && row.old_values && (
        <div>
          <strong>Deleted record:</strong> <RecordFields values={row.old_values} lookups={lookups} />
        </div>
      )}
      {row.action === "create" && row.new_values && (
        <div>
          <strong>Created with:</strong> <RecordFields values={row.new_values} lookups={lookups} />
        </div>
      )}
    </div>
  );
}

const OMITTED_FIELDS = ["id", "created_at", "created_by", "updated_at", "updated_by"];

// Resolves an "*_id" field to a human-readable name via ID_FIELD_LOOKUPS +
// the lookups maps built in AuditLog(); falls back to the raw value when
// there's no lookup for that field or the id isn't found (e.g. since
// deleted).
function displayValue(key, value, lookups) {
  const mapping = ID_FIELD_LOOKUPS[key];
  if (mapping && value != null) {
    const [mapName] = mapping;
    const name = lookups?.[mapName]?.[value];
    if (name) return name;
  }
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function RecordFields({ values, lookups }) {
  const entries = Object.entries(values || {}).filter(([k, v]) => !OMITTED_FIELDS.includes(k) && v !== null);
  if (entries.length === 0) return <span style={{ color: "var(--a-text-3)" }}>—</span>;
  return (
    <span>
      {entries.map(([k, v], i) => (
        <span key={k}>
          {i > 0 && ", "}
          <em style={{ fontStyle: "normal", color: "var(--a-text-3)" }}>{k}:</em> {displayValue(k, v, lookups)}
        </span>
      ))}
    </span>
  );
}

function ValueDiff({ oldValues, newValues, lookups }) {
  const changedKeys = Object.keys(newValues || {}).filter(
    (k) => !["id", "created_at", "created_by", "updated_at", "updated_by"].includes(k) && JSON.stringify(oldValues?.[k]) !== JSON.stringify(newValues?.[k]),
  );
  if (changedKeys.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
      {changedKeys.map((k) => (
        <div key={k}>
          <strong>{k}:</strong> {oldValues?.[k] != null ? displayValue(k, oldValues[k], lookups) : "—"}{" "}
          <ChevronRight size={11} style={{ verticalAlign: "middle" }} />{" "}
          {newValues?.[k] != null ? displayValue(k, newValues[k], lookups) : "—"}
        </div>
      ))}
    </div>
  );
}
