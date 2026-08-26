import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAdminUI, usePageTitle } from "../../context/AdminUIContext";
import Modal from "../Modal";
import Dropdown from "../Dropdown";
import DatePicker from "../DatePicker";
import Button from "../Button";
import CardCornerActions from "../CardCornerActions";
import AnimatedCheckbox from "../AnimatedCheckbox";
import Pagination, { paginate } from "../Pagination";
import { SkeletonCardGrid, SkeletonRows } from "../Skeleton";
import { thStyle, tdStyle, iconBtnStyle, labelStyle, cardStyle } from "./adminUiStyles";

// Generic dense data-table (or card grid) + modal form used by every master
// page, so all masters share one toolbar/filter/CRUD pattern.
export default function MasterTable({
  title,
  singular,
  icon,
  accent = "var(--a-brand)",
  table,
  selectQuery = "*",
  columns,
  fields,
  readOnly = false,
  searchKeys = [],
  remoteSearch,
  orderBy = { column: "created_at", ascending: false },
  emptyLabel = "No records yet.",
  onBeforeSave,
  rowActions,
  layout = "table",
  renderCard,
  cardMinWidth = 260,
  pageSize = layout === "cards" ? 12 : 20,
}) {
  usePageTitle(title);
  const { searchQuery } = useAdminUI();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);

  // With remoteSearch supplied, a non-empty search term re-queries Postgres
  // directly (genuine backend filtering, e.g. a join through another table)
  // instead of filtering an already-fetched local array — stays fast and
  // accurate as the underlying table grows, rather than fetching everything
  // up front. Without a search term (or without remoteSearch at all) it
  // falls back to the normal base query.
  async function load(query = "") {
    setLoading(true);
    setError("");
    const trimmed = query.trim();
    const { data, error } =
      remoteSearch && trimmed
        ? await remoteSearch(supabase, trimmed)
        : await supabase.from(table).select(selectQuery).order(orderBy.column, { ascending: orderBy.ascending });
    if (error) setError(error.message);
    else setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load(searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  // Skip re-running for a searchQuery we've already loaded for (i.e. the
  // mount-effect above already covered it) — otherwise this fires a
  // redundant second fetch ~300ms later and flashes the skeleton back in
  // over live data. Compares against the last-loaded value rather than a
  // one-shot boolean because React's Strict Mode replays effects once on
  // mount (effect → cleanup → effect again); a mutating boolean flag gets
  // flipped by that throwaway first run and no longer guards the real one,
  // while a value comparison stays correct across the replay.
  const lastLoadedSearch = useRef(searchQuery);
  useEffect(() => {
    if (!remoteSearch) return;
    if (lastLoadedSearch.current === searchQuery) return;
    lastLoadedSearch.current = searchQuery;
    const timer = setTimeout(() => load(searchQuery), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const filtered = useMemo(() => {
    if (remoteSearch) return rows;
    if (!searchQuery.trim() || searchKeys.length === 0) return rows;
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((r) => searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q)));
  }, [rows, searchQuery, searchKeys, remoteSearch]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, rows.length]);

  const { pageItems, totalPages, safePage } = paginate(filtered, page, pageSize);

  function openCreate() {
    setEditingRow(null);
    const defaults = {};
    fields.forEach((f) => {
      defaults[f.key] = f.type === "checkbox" ? false : "";
    });
    setFormValues(defaults);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditingRow(row);
    const values = {};
    fields.forEach((f) => {
      values[f.key] = row[f.key] ?? (f.type === "checkbox" ? false : "");
    });
    setFormValues(values);
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingRow(null);
    setFormError("");
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    let payload = { ...formValues };
    for (const f of fields) {
      if (f.type === "number") {
        payload[f.key] = payload[f.key] === "" ? null : Number(payload[f.key]);
        if (f.min !== undefined && payload[f.key] !== null && payload[f.key] < f.min) {
          setFormError(`${f.label} must be at least ${f.min}`);
          setSaving(false);
          return;
        }
      }
      if (f.required && (payload[f.key] === "" || payload[f.key] === null || payload[f.key] === undefined)) {
        setFormError(`${f.label} is required`);
        setSaving(false);
        return;
      }
    }
    if (onBeforeSave) {
      const result = onBeforeSave(payload, editingRow, rows);
      if (result?.error) {
        setFormError(result.error);
        setSaving(false);
        return;
      }
      payload = result?.payload || payload;
    }

    const query = editingRow
      ? supabase.from(table).update(payload).eq("id", editingRow.id)
      : supabase.from(table).insert(payload);

    const { error } = await query;
    setSaving(false);
    if (error) {
      setFormError(error.message);
      return;
    }
    closeModal();
    load(searchQuery);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const { error } = await supabase.from(table).delete().eq("id", deleteTarget.id);
    if (error) {
      setError(error.message);
    }
    setDeleteTarget(null);
    load(searchQuery);
  }

  const singularLabel = singular || title.replace(/s$/, "");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem" }}>
        {!readOnly && (
          <Button onClick={openCreate}>
            <Plus size={16} /> Add
          </Button>
        )}
      </div>

      {error && <div style={{ color: "var(--a-danger)", fontSize: "14.5px", marginBottom: "10px" }}>{error}</div>}

      {layout === "cards" ? (
        loading ? (
          <SkeletonCardGrid minWidth={cardMinWidth} />
        ) : (
          <CardGrid
            rows={pageItems}
            emptyLabel={emptyLabel}
            renderCard={renderCard}
            readOnly={readOnly}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            rowActions={rowActions}
            cardMinWidth={cardMinWidth}
          />
        )
      ) : (
        <div style={{ ...cardStyle, overflow: "auto" }}>
          {loading ? (
            <SkeletonRows columns={columns.length} />
          ) : (
          <table style={{ width: "100%", minWidth: "560px", borderCollapse: "collapse", fontSize: "15.5px" }}>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key} style={thStyle}>
                    {c.label}
                  </th>
                ))}
                {!readOnly && <th style={{ ...thStyle, width: "90px" }}></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} style={{ ...tdStyle, textAlign: "center", color: "var(--a-text-3)" }}>
                    {emptyLabel}
                  </td>
                </tr>
              ) : (
                pageItems.map((row) => (
                  <tr key={row.id} className="admin-table-row">
                    {columns.map((c) => (
                      <td key={c.key} style={tdStyle}>
                        {c.render ? c.render(row) : row[c.key]}
                      </td>
                    ))}
                    {!readOnly && (
                      <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                        {rowActions ? (
                          rowActions(row)
                        ) : (
                          <>
                            <button onClick={() => openEdit(row)} style={iconBtnStyle} aria-label="Edit">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => setDeleteTarget(row)} style={iconBtnStyle} aria-label="Delete">
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          )}
          <style>{`.admin-table-row:hover { background: var(--a-bg-elevated); }`}</style>
        </div>
      )}

      {!loading && <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />}

      {modalOpen && (
        <Modal
          title={editingRow ? `Edit ${singularLabel}` : `Add ${singularLabel}`}
          icon={icon}
          accent={accent}
          onClose={closeModal}
        >
          <form onSubmit={handleSave}>
            {fields.map((f) => (
              <div key={f.key} style={{ marginBottom: "1rem" }}>
                {f.type !== "checkbox" && (
                  <label style={labelStyle}>
                    {f.label} {f.required && <span style={{ color: "var(--a-danger)" }}>*</span>}
                  </label>
                )}
                {f.type === "checkbox" ? (
                  <AnimatedCheckbox
                    checked={!!formValues[f.key]}
                    onChange={(val) => setFormValues((v) => ({ ...v, [f.key]: val }))}
                    label={f.label}
                  />
                ) : f.type === "select" ? (
                  <Dropdown
                    value={formValues[f.key] ?? ""}
                    onChange={(val) => setFormValues((v) => ({ ...v, [f.key]: val }))}
                    options={f.options || []}
                    required={f.required}
                  />
                ) : f.type === "date" ? (
                  <DatePicker
                    value={formValues[f.key] ?? ""}
                    onChange={(val) => setFormValues((v) => ({ ...v, [f.key]: val }))}
                    required={f.required}
                  />
                ) : (
                  <input
                    type={f.type || "text"}
                    step={f.step}
                    min={f.min}
                    value={formValues[f.key] ?? ""}
                    onChange={(e) => setFormValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    required={f.required}
                    style={{ width: "100%" }}
                    disabled={f.disabled}
                  />
                )}
                {f.hint && <div style={{ fontSize: "13.5px", color: "var(--a-text-3)", marginTop: "4px" }}>{f.hint}</div>}
              </div>
            ))}

            {formError && <div style={{ color: "var(--a-danger)", fontSize: "14.5px", marginBottom: "1rem" }}>{formError}</div>}

            <Button type="submit" disabled={saving} style={{ width: "100%" }}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete this record?" icon={Trash2} accent="var(--a-danger)" onClose={() => setDeleteTarget(null)} maxWidth="360px">
          <p style={{ fontSize: "16px", color: "var(--a-text-2)", marginTop: 0 }}>This action cannot be undone.</p>
          <div style={{ display: "flex", gap: "10px", marginTop: "1.25rem" }}>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} style={{ flex: 1 }}>
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CardGrid({ rows, emptyLabel, renderCard, readOnly, onEdit, onDelete, rowActions, cardMinWidth = 260 }) {
  if (rows.length === 0) return <div style={{ ...cardStyle, padding: "2rem", textAlign: "center", color: "var(--a-text-3)" }}>{emptyLabel}</div>;

  return (
    <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: `repeat(auto-fill, minmax(min(${cardMinWidth}px, 100%), 1fr))` }}>
      {rows.map((row) => (
        <div key={row.id} style={{ ...cardStyle, padding: "1.5rem", paddingBottom: readOnly ? "1.5rem" : "3.25rem", position: "relative" }}>
          {renderCard(row)}
          {!readOnly &&
            (rowActions ? (
              rowActions(row)
            ) : (
              <CardCornerActions onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />
            ))}
        </div>
      ))}
    </div>
  );
}
