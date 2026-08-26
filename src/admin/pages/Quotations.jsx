import { useEffect, useMemo, useState } from "react";
import { Plus, FileText, Trash2, Download, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useAdminUI, usePageTitle } from "../context/AdminUIContext";
import Modal from "../components/Modal";
import Dropdown from "../components/Dropdown";
import DatePicker, { formatDisplayDate } from "../components/DatePicker";
import Button from "../components/Button";
import Pagination, { paginate } from "../components/Pagination";
import { SkeletonCardGrid } from "../components/Skeleton";
import { labelStyle, cardStyle } from "../components/masters/adminUiStyles";
import { downloadQuotationPDF } from "../lib/pdfExport";

const PAGE_SIZE = 12;
const SUBJECT_OPTIONS = ["Sprockets", "Gears", "Shafts", "Coupling"].map((v) => ({ value: v, label: v }));
const EMPTY_ITEM = { item_description: "", moc: "", quantity: "", unit_rate: "" };

export default function Quotations() {
  usePageTitle("Quotations");
  const { isAdmin } = useAuth();
  const { searchQuery } = useAdminUI();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [exportingId, setExportingId] = useState(null);
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("quotations")
      .select("*, quotation_items(*)")
      .order("created_at", { ascending: false });
    setQuotations(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return quotations;
    const q = searchQuery.trim().toLowerCase();
    return quotations.filter((qt) =>
      [qt.quotation_number, qt.client_name, qt.subject, qt.enquiry_number]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q)),
    );
  }, [quotations, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, quotations.length]);

  const { pageItems, totalPages, safePage } = paginate(filtered, page, PAGE_SIZE);

  async function handleExport(quotation) {
    setExportingId(quotation.id);
    try {
      const items = (quotation.quotation_items || []).slice().sort((a, b) => a.sort_order - b.sort_order);
      await downloadQuotationPDF(quotation, items);
    } finally {
      setExportingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await supabase.from("quotations").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem" }}>
        {isAdmin && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} /> New quotation
          </Button>
        )}
      </div>

      {loading ? (
        <SkeletonCardGrid count={PAGE_SIZE} minWidth={320} cardHeight={220} />
      ) : filtered.length === 0 ? (
        <div style={{ ...cardStyle, padding: "2.5rem", textAlign: "center", color: "var(--a-text-3)", fontSize: "16.5px" }}>
          No quotations yet.
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gap: "1.25rem",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))",
            }}
          >
            {pageItems.map((qt) => (
              <QuotationCard
                key={qt.id}
                quotation={qt}
                exporting={exportingId === qt.id}
                onExport={() => handleExport(qt)}
                onDelete={isAdmin ? () => setDeleteTarget(qt) : null}
              />
            ))}
          </div>
          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {modalOpen && <CreateQuotationModal onClose={() => setModalOpen(false)} onCreated={load} />}

      {deleteTarget && (
        <Modal title="Delete this quotation?" icon={Trash2} accent="var(--a-danger)" onClose={() => setDeleteTarget(null)} maxWidth="360px">
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

function QuotationCard({ quotation, exporting, onExport, onDelete }) {
  const total = (quotation.quotation_items || []).reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unit_rate) || 0),
    0,
  );
  return (
    <div style={{ ...cardStyle, padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "var(--a-brand-tint)",
              color: "var(--a-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FileText size={16} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: "16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {quotation.quotation_number}
            </div>
            <div style={{ fontSize: "13px", color: "var(--a-text-3)" }}>{formatDisplayDate(quotation.quotation_date)}</div>
          </div>
        </div>
        {onDelete && (
          <button onClick={onDelete} aria-label="Delete" style={{ background: "none", border: "none", color: "var(--a-text-3)", cursor: "pointer", padding: "4px" }}>
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div style={{ fontSize: "14.5px", fontWeight: 600, color: "var(--a-text-1)", marginBottom: "4px" }}>{quotation.client_name}</div>
      {quotation.subject && (
        <div style={{ fontSize: "13px", color: "var(--a-text-3)", marginBottom: "10px" }}>{quotation.subject}</div>
      )}

      <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--a-text-2)", marginBottom: "14px" }}>
        Total: ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      <Button size="sm" onClick={onExport} disabled={exporting} style={{ width: "100%" }}>
        <Download size={14} /> {exporting ? "Preparing…" : "Export PDF"}
      </Button>
    </div>
  );
}

function CreateQuotationModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    quotation_number: "",
    quotation_date: "",
    client_name: "",
    client_address: "",
    staff_name: "",
    subject: "",
    enquiry_number: "",
    delivery_time: "",
  });
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateItem(idx, key, value) {
    setItems((rows) => rows.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));
  }

  function addItem() {
    setItems((rows) => [...rows, { ...EMPTY_ITEM }]);
  }

  function removeItem(idx) {
    setItems((rows) => (rows.length > 1 ? rows.filter((_, i) => i !== idx) : rows));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.quotation_number || !form.quotation_date || !form.client_name) {
      setError("Quotation number, date and client name are required");
      return;
    }
    const validItems = items.filter((it) => it.item_description.trim());
    if (validItems.length === 0) {
      setError("Add at least one item with a description");
      return;
    }

    setSaving(true);

    const { data: quotation, error: qError } = await supabase
      .from("quotations")
      .insert({
        quotation_number: form.quotation_number,
        quotation_date: form.quotation_date,
        client_name: form.client_name,
        client_address: form.client_address || null,
        staff_name: form.staff_name || null,
        subject: form.subject || null,
        enquiry_number: form.enquiry_number || null,
        delivery_time: form.delivery_time || null,
      })
      .select()
      .single();

    if (qError) {
      setError(qError.message);
      setSaving(false);
      return;
    }

    const itemRows = validItems.map((it, idx) => ({
      quotation_id: quotation.id,
      item_description: it.item_description,
      moc: it.moc || null,
      quantity: Number(it.quantity) || 0,
      unit_rate: Number(it.unit_rate) || 0,
      sort_order: idx,
    }));

    const { error: itemsError } = await supabase.from("quotation_items").insert(itemRows);
    setSaving(false);

    if (itemsError) {
      setError(itemsError.message);
      return;
    }

    onCreated();
    onClose();
  }

  return (
    <Modal title="New quotation" icon={FileText} accent="var(--a-brand)" onClose={onClose} maxWidth="760px">
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1rem" }}>
          <div>
            <label style={labelStyle}>Quotation number *</label>
            <input
              value={form.quotation_number}
              onChange={(e) => setForm((v) => ({ ...v, quotation_number: e.target.value }))}
              required
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label style={labelStyle}>Date *</label>
            <DatePicker
              value={form.quotation_date}
              onChange={(val) => setForm((v) => ({ ...v, quotation_date: val }))}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Client name *</label>
          <input
            value={form.client_name}
            onChange={(e) => setForm((v) => ({ ...v, client_name: e.target.value }))}
            required
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Address</label>
          <textarea
            value={form.client_address}
            onChange={(e) => setForm((v) => ({ ...v, client_address: e.target.value }))}
            rows={2}
            style={{ width: "100%", resize: "vertical" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1rem" }}>
          <div>
            <label style={labelStyle}>Staff name</label>
            <input
              value={form.staff_name}
              onChange={(e) => setForm((v) => ({ ...v, staff_name: e.target.value }))}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label style={labelStyle}>Subject</label>
            <Dropdown
              value={form.subject}
              onChange={(val) => setForm((v) => ({ ...v, subject: val }))}
              options={SUBJECT_OPTIONS}
              placeholder="Select subject…"
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1.25rem" }}>
          <div>
            <label style={labelStyle}>Enquiry number</label>
            <input
              value={form.enquiry_number}
              onChange={(e) => setForm((v) => ({ ...v, enquiry_number: e.target.value }))}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label style={labelStyle}>Delivery time</label>
            <input
              value={form.delivery_time}
              onChange={(e) => setForm((v) => ({ ...v, delivery_time: e.target.value }))}
              placeholder="e.g. 4-6 weeks"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Items *</label>
          <Button type="button" size="sm" variant="secondary" onClick={addItem}>
            <Plus size={14} /> Add item
          </Button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "1.25rem" }}>
          {items.map((row, idx) => (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "2.2fr 1fr 0.8fr 1fr auto",
                gap: "8px",
                alignItems: "center",
                background: "var(--a-bg-elevated)",
                borderRadius: "10px",
                padding: "10px",
              }}
            >
              <input
                placeholder="Item description"
                value={row.item_description}
                onChange={(e) => updateItem(idx, "item_description", e.target.value)}
                style={{ width: "100%" }}
              />
              <input
                placeholder="MOC"
                value={row.moc}
                onChange={(e) => updateItem(idx, "moc", e.target.value)}
                style={{ width: "100%" }}
              />
              <input
                type="number"
                min="0"
                step="any"
                placeholder="Qty"
                value={row.quantity}
                onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                style={{ width: "100%" }}
              />
              <input
                type="number"
                min="0"
                step="any"
                placeholder="Unit rate"
                value={row.unit_rate}
                onChange={(e) => updateItem(idx, "unit_rate", e.target.value)}
                style={{ width: "100%" }}
              />
              <button
                type="button"
                onClick={() => removeItem(idx)}
                disabled={items.length === 1}
                aria-label="Remove item"
                style={{
                  background: "none",
                  border: "none",
                  color: items.length === 1 ? "var(--a-text-3)" : "var(--a-danger)",
                  cursor: items.length === 1 ? "not-allowed" : "pointer",
                  padding: "6px",
                  opacity: items.length === 1 ? 0.4 : 1,
                }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {error && <div style={{ color: "var(--a-danger)", fontSize: "14.5px", marginBottom: "1rem" }}>{error}</div>}

        <Button type="submit" disabled={saving} style={{ width: "100%" }}>
          {saving ? "Creating…" : "Create quotation"}
        </Button>
      </form>
    </Modal>
  );
}
