import { useEffect, useMemo, useState } from "react";
import { Plus, ShoppingCart, Trash2, Download, X, Pencil } from "lucide-react";
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
import { downloadPurchaseOrderPDF } from "../lib/pdfExport";

const PAGE_SIZE = 12;
const EMPTY_ITEM = { item_description: "", quantity: "", unit_rate: "" };

export default function PODocuments() {
  usePageTitle("Purchase order documents");
  const { isAdmin } = useAuth();
  const { searchQuery } = useAdminUI();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [exportingId, setExportingId] = useState(null);
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("purchase_order_documents")
      .select("*, purchase_order_document_items(*)")
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((po) =>
      [po.quotation_number, po.client_name].filter(Boolean).some((v) => v.toLowerCase().includes(q)),
    );
  }, [orders, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, orders.length]);

  const { pageItems, totalPages, safePage } = paginate(filtered, page, PAGE_SIZE);

  async function handleExport(po) {
    setExportingId(po.id);
    try {
      const items = (po.purchase_order_document_items || []).slice().sort((a, b) => a.sort_order - b.sort_order);
      await downloadPurchaseOrderPDF(po, items);
    } finally {
      setExportingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await supabase.from("purchase_order_documents").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem" }}>
        {isAdmin && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} /> New purchase order
          </Button>
        )}
      </div>

      {loading ? (
        <SkeletonCardGrid count={PAGE_SIZE} minWidth={320} cardHeight={220} />
      ) : filtered.length === 0 ? (
        <div style={{ ...cardStyle, padding: "2.5rem", textAlign: "center", color: "var(--a-text-3)", fontSize: "16.5px" }}>
          No purchase order documents yet.
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
            {pageItems.map((po) => (
              <PODocumentCard
                key={po.id}
                po={po}
                exporting={exportingId === po.id}
                onExport={() => handleExport(po)}
                onEdit={isAdmin ? () => setEditTarget(po) : null}
                onDelete={isAdmin ? () => setDeleteTarget(po) : null}
              />
            ))}
          </div>
          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {(modalOpen || editTarget) && (
        <POModal
          key={editTarget?.id || "new"}
          existing={editTarget}
          onClose={() => {
            setModalOpen(false);
            setEditTarget(null);
          }}
          onSaved={load}
        />
      )}

      {deleteTarget && (
        <Modal title="Delete this purchase order?" icon={Trash2} accent="var(--a-danger)" onClose={() => setDeleteTarget(null)} maxWidth="360px">
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

const cardIconBtn = { background: "none", border: "none", color: "var(--a-text-3)", cursor: "pointer", padding: "4px" };

function PODocumentCard({ po, exporting, onExport, onEdit, onDelete }) {
  const total = (po.purchase_order_document_items || []).reduce(
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
            <ShoppingCart size={16} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: "16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {po.quotation_number || "—"}
            </div>
            <div style={{ fontSize: "13px", color: "var(--a-text-3)" }}>{formatDisplayDate(po.po_date)}</div>
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
            {onEdit && (
              <button onClick={onEdit} aria-label="Edit" style={cardIconBtn}>
                <Pencil size={14} />
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} aria-label="Delete" style={cardIconBtn}>
                <Trash2 size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ fontSize: "14.5px", fontWeight: 600, color: "var(--a-text-1)", marginBottom: "4px" }}>{po.client_name}</div>
      {po.delivery_date && (
        <div style={{ fontSize: "13px", color: "var(--a-text-3)", marginBottom: "10px" }}>
          Delivery: {formatDisplayDate(po.delivery_date)}
        </div>
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

function POModal({ existing, onClose, onSaved }) {
  const isEdit = !!existing;
  const [form, setForm] = useState({
    quotation_number: existing?.quotation_number || "",
    po_date: existing?.po_date || "",
    client_name: existing?.client_name || "",
    client_address: existing?.client_address || "",
    delivery_date: existing?.delivery_date || "",
  });
  const [items, setItems] = useState(() =>
    existing?.purchase_order_document_items?.length
      ? existing.purchase_order_document_items
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((it) => ({
            item_description: it.item_description || "",
            quantity: it.quantity ?? "",
            unit_rate: it.unit_rate ?? "",
          }))
      : [{ ...EMPTY_ITEM }],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [companyOptions, setCompanyOptions] = useState([]);

  useEffect(() => {
    supabase
      .from("companies")
      .select("name")
      .order("name", { ascending: true })
      .then(({ data }) =>
        setCompanyOptions((data || []).map((c) => ({ value: c.name, label: c.name }))),
      );
  }, []);

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

    if (!form.po_date || !form.client_name) {
      setError("Date and client name are required");
      return;
    }
    const validItems = items.filter((it) => it.item_description.trim());
    if (validItems.length === 0) {
      setError("Add at least one item with a description");
      return;
    }

    setSaving(true);

    const payload = {
      quotation_number: form.quotation_number || null,
      po_date: form.po_date,
      client_name: form.client_name,
      client_address: form.client_address || null,
      delivery_date: form.delivery_date || null,
    };

    let poId = existing?.id;

    if (isEdit) {
      const { error: uError } = await supabase
        .from("purchase_order_documents")
        .update(payload)
        .eq("id", poId);
      if (uError) {
        setError(uError.message);
        setSaving(false);
        return;
      }
      await supabase.from("purchase_order_document_items").delete().eq("po_document_id", poId);
    } else {
      const { data: po, error: poError } = await supabase
        .from("purchase_order_documents")
        .insert(payload)
        .select()
        .single();
      if (poError) {
        setError(poError.message);
        setSaving(false);
        return;
      }
      poId = po.id;
    }

    const itemRows = validItems.map((it, idx) => ({
      po_document_id: poId,
      item_description: it.item_description,
      quantity: Number(it.quantity) || 0,
      unit_rate: Number(it.unit_rate) || 0,
      sort_order: idx,
    }));

    const { error: itemsError } = await supabase.from("purchase_order_document_items").insert(itemRows);
    setSaving(false);

    if (itemsError) {
      setError(itemsError.message);
      return;
    }

    onSaved();
    onClose();
  }

  return (
    <Modal title={isEdit ? "Edit purchase order" : "New purchase order"} icon={ShoppingCart} accent="var(--a-brand)" onClose={onClose} maxWidth="720px">
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1rem" }}>
          <div>
            <label style={labelStyle}>Quotation number</label>
            <input
              value={form.quotation_number}
              onChange={(e) => setForm((v) => ({ ...v, quotation_number: e.target.value }))}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label style={labelStyle}>Date *</label>
            <DatePicker value={form.po_date} onChange={(val) => setForm((v) => ({ ...v, po_date: val }))} required />
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Client name *</label>
          <Dropdown
            searchable
            creatable
            required
            value={form.client_name}
            onChange={(val) => setForm((v) => ({ ...v, client_name: val }))}
            options={companyOptions}
            placeholder="Select or type supplier…"
            searchPlaceholder="Search companies…"
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

        <div style={{ marginBottom: "1.25rem" }}>
          <label style={labelStyle}>Delivery date</label>
          <DatePicker value={form.delivery_date} onChange={(val) => setForm((v) => ({ ...v, delivery_date: val }))} />
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
                gridTemplateColumns: "2.4fr 1fr 1fr auto",
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
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create purchase order"}
        </Button>
      </form>
    </Modal>
  );
}
