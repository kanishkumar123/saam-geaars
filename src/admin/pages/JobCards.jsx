import { useEffect, useMemo, useState } from "react";
import { Plus, ClipboardList, FileSpreadsheet } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useAdminUI, usePageTitle } from "../context/AdminUIContext";
import Modal from "../components/Modal";
import Dropdown from "../components/Dropdown";
import DatePicker from "../components/DatePicker";
import Button from "../components/Button";
import JobCardTile from "../components/JobCardTile";
import Pagination, { paginate } from "../components/Pagination";
import { SkeletonCardGrid } from "../components/Skeleton";
import { labelStyle, cardStyle } from "../components/masters/adminUiStyles";
import { withJobCardInsights, sortByPriority } from "../lib/jobCardInsights";
import { exportJobCardsToExcel } from "../lib/excelExport";

// 12 (not 6) so a full page reliably fills 2, 3, or 4 columns without a
// ragged, gappy last row while more cards sit unnecessarily on the next
// page — 6 only divides evenly for 2 or 3 columns, not 4.
const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "priority", label: "Priority" },
  { value: "blocked", label: "Not completed" },
  { value: "completed", label: "Completed" },
  { value: "all", label: "All" },
];

export default function JobCards() {
  usePageTitle("Job cards");
  const { isAdmin } = useAuth();
  const { searchQuery } = useAdminUI();
  const [jobCards, setJobCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sortMode, setSortMode] = useState("priority");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("job_cards")
      .select(
        "id, order_due_date, quantity, cost_per_unit, projects(po_number), companies(name, is_client, is_supplier), tasks(part_number, item_description), job_card_stages(stage_order, stage_type, status, remarks)",
      )
      .order("order_due_date", { ascending: true });
    setJobCards(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const searched = useMemo(() => {
    if (!searchQuery.trim()) return jobCards;
    const q = searchQuery.trim().toLowerCase();
    return jobCards.filter((jc) =>
      [
        jc.projects?.po_number,
        jc.tasks?.part_number,
        jc.tasks?.item_description,
        jc.companies?.name,
      ]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q)),
    );
  }, [jobCards, searchQuery]);

  // Same insight/priority logic as the Dashboard's Priority Job Cards
  // preview, so the two stay consistent. "All" skips the priority reorder
  // and just keeps the base due-date-ascending order from the query.
  const filtered = useMemo(() => {
    const withInsights = withJobCardInsights(searched);
    if (sortMode === "blocked")
      return withInsights.filter((jc) => jc.isBlocked);
    if (sortMode === "completed")
      return withInsights.filter((jc) => jc.isFullyComplete);
    if (sortMode === "all") return withInsights;
    return sortByPriority(withInsights);
  }, [searched, sortMode]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortMode, jobCards.length]);

  const { pageItems, totalPages, safePage } = paginate(
    filtered,
    page,
    PAGE_SIZE,
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            background: "var(--a-bg-elevated)",
            borderRadius: "10px",
            padding: "3px",
            maxWidth: "100%",
            overflowX: "auto",
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortMode(opt.value)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                background:
                  sortMode === opt.value ? "var(--a-card)" : "transparent",
                color:
                  sortMode === opt.value
                    ? "var(--a-text-1)"
                    : "var(--a-text-3)",
                boxShadow: sortMode === opt.value ? "var(--a-shadow)" : "none",
                transition: "all 0.18s ease",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            variant="secondary"
            onClick={() => exportJobCardsToExcel(filtered)}
            disabled={filtered.length === 0}
          >
            <FileSpreadsheet size={16} /> Export
          </Button>
          {isAdmin && (
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={16} /> New job card
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <SkeletonCardGrid count={PAGE_SIZE} minWidth={380} cardHeight={300} />
      ) : filtered.length === 0 ? (
        <div
          style={{
            ...cardStyle,
            padding: "2.5rem",
            textAlign: "center",
            color: "var(--a-text-3)",
            fontSize: "16.5px",
          }}
        >
          No job cards yet.
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gap: "1.75rem",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(380px, 100%), 1fr))",
            }}
          >
            {pageItems.map((jc) => (
              <JobCardTile key={jc.id} jc={jc} />
            ))}
          </div>
          <Pagination
            page={safePage}
            totalPages={totalPages}
            onChange={setPage}
          />
        </>
      )}

      {modalOpen && (
        <CreateJobCardModal
          onClose={() => setModalOpen(false)}
          onCreated={load}
        />
      )}
    </div>
  );
}

function CreateJobCardModal({ onClose, onCreated }) {
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({
    company_id: "",
    project_id: "",
    task_id: "",
    quantity: "",
    cost_per_unit: "",
    order_due_date: "",
    process_template_id: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("companies")
      .select("id, name")
      .eq("is_client", true)
      .order("name")
      .then(({ data }) => setCompanies(data || []));
    supabase
      .from("projects")
      .select("id, po_number, company_id")
      .order("po_number")
      .then(({ data }) => setProjects(data || []));
    supabase
      .from("tasks")
      .select("id, part_number, item_description")
      .order("part_number")
      .then(({ data }) => setTasks(data || []));
    supabase
      .from("process_templates")
      .select("id, name")
      .order("name")
      .then(({ data }) => setTemplates(data || []));
  }, []);

  const filteredProjects = useMemo(
    () =>
      form.company_id
        ? projects.filter((p) => p.company_id === form.company_id)
        : projects,
    [projects, form.company_id],
  );

  function handleProjectChange(projectId) {
    const project = projects.find((p) => p.id === projectId);
    setForm((v) => ({
      ...v,
      project_id: projectId,
      company_id: project?.company_id || v.company_id,
    }));
  }

  function handleCompanyChange(companyId) {
    setForm((v) => ({ ...v, company_id: companyId, project_id: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const qty = Number(form.quantity);
    const cost = Number(form.cost_per_unit);
    if (
      !form.company_id ||
      !form.project_id ||
      !form.task_id ||
      !form.process_template_id ||
      !form.order_due_date
    ) {
      setError("All fields are required");
      return;
    }
    if (!qty || qty <= 0) {
      setError("Quantity must be greater than zero");
      return;
    }
    if (cost < 0 || Number.isNaN(cost)) {
      setError("Cost per unit must be zero or greater");
      return;
    }

    setSaving(true);

    const { data: jobCard, error: jcError } = await supabase
      .from("job_cards")
      .insert({
        company_id: form.company_id,
        project_id: form.project_id,
        task_id: form.task_id,
        quantity: qty,
        cost_per_unit: cost,
        order_due_date: form.order_due_date,
        process_template_id: form.process_template_id,
      })
      .select()
      .single();

    if (jcError) {
      setError(jcError.message);
      setSaving(false);
      return;
    }

    const { data: templateStages } = await supabase
      .from("process_template_stages")
      .select("stage_order, stage_type")
      .eq("template_id", form.process_template_id)
      .order("stage_order");

    const stageRows = (templateStages || []).map((s) => ({
      job_card_id: jobCard.id,
      stage_order: s.stage_order,
      stage_type: s.stage_type,
    }));

    const { error: stagesError } = await supabase
      .from("job_card_stages")
      .insert(stageRows);
    setSaving(false);

    if (stagesError) {
      setError(stagesError.message);
      return;
    }

    onCreated();
    onClose();
  }

  return (
    <Modal
      title="New job card"
      icon={ClipboardList}
      accent="var(--a-brand)"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Company *</label>
          <Dropdown
            value={form.company_id}
            onChange={handleCompanyChange}
            options={companies.map((c) => ({ value: c.id, label: c.name }))}
            required
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>PO number *</label>
          <Dropdown
            value={form.project_id}
            onChange={handleProjectChange}
            options={filteredProjects.map((p) => ({
              value: p.id,
              label: p.po_number,
            }))}
            searchable
            searchPlaceholder="Search PO number…"
            required
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Item (part number) *</label>
          <Dropdown
            value={form.task_id}
            onChange={(val) => setForm((v) => ({ ...v, task_id: val }))}
            options={tasks.map((t) => ({
              value: t.id,
              label: `${t.part_number} — ${t.item_description}`,
            }))}
            searchable
            searchPlaceholder="Search item / part number…"
            required
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "1rem",
          }}
        >
          <div>
            <label style={labelStyle}>Quantity *</label>
            <input
              type="number"
              min="0.01"
              step="any"
              value={form.quantity}
              onChange={(e) =>
                setForm((v) => ({ ...v, quantity: e.target.value }))
              }
              required
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label style={labelStyle}>Cost per unit *</label>
            <input
              type="number"
              min="0"
              step="any"
              value={form.cost_per_unit}
              onChange={(e) =>
                setForm((v) => ({ ...v, cost_per_unit: e.target.value }))
              }
              required
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Order due date *</label>
          <DatePicker
            value={form.order_due_date}
            onChange={(val) => setForm((v) => ({ ...v, order_due_date: val }))}
            required
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Process template *</label>
          <Dropdown
            value={form.process_template_id}
            onChange={(val) =>
              setForm((v) => ({ ...v, process_template_id: val }))
            }
            options={templates.map((t) => ({ value: t.id, label: t.name }))}
            required
          />
        </div>

        {error && (
          <div
            style={{
              color: "var(--a-danger)",
              fontSize: "14.5px",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        <Button type="submit" disabled={saving} style={{ width: "100%" }}>
          {saving ? "Creating…" : "Create job card"}
        </Button>
      </form>
    </Modal>
  );
}
