import { useEffect, useRef, useState } from "react";
import { Plus, PackageCheck, Truck, Clock, Building2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { formatDate, parseDateFragmentToRange } from "../lib/dateUtils";
import { usePageTitle, useAdminUI } from "../context/AdminUIContext";
import Modal from "../components/Modal";
import Dropdown from "../components/Dropdown";
import Button from "../components/Button";
import Pagination, { paginate } from "../components/Pagination";
import { SkeletonCardGrid } from "../components/Skeleton";
import { labelStyle, cardStyle } from "../components/masters/adminUiStyles";

const ACCENT = "#16a34a";
const PAGE_SIZE = 9;
const SELECT = "*, raw_materials(name), companies(name)";

export default function SupplierOrders() {
  usePageTitle("Supplier orders");
  const { searchQuery } = useAdminUI();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [receivingId, setReceivingId] = useState(null);
  const [page, setPage] = useState(1);

  // Company + date search genuinely re-queries Postgres (company name via a
  // join-derived id list, date via a gte/lte range) instead of filtering an
  // already-fetched local array.
  async function load(query = "") {
    setLoading(true);
    const trimmed = query.trim();

    let result;
    if (trimmed) {
      const like = `%${trimmed}%`;
      const dateRange = parseDateFragmentToRange(trimmed);

      const { data: matchedCompanies } = await supabase.from("companies").select("id").ilike("name", like);
      const companyIds = (matchedCompanies || []).map((c) => c.id);

      const orParts = [];
      if (companyIds.length) orParts.push(`company_id.in.(${companyIds.join(",")})`);
      if (dateRange) orParts.push(`and(created_at.gte.${dateRange.gte}T00:00:00,created_at.lte.${dateRange.lte}T23:59:59)`);

      if (orParts.length === 0) {
        result = { data: [], error: null };
      } else {
        result = await supabase.from("supplier_orders").select(SELECT).or(orParts.join(",")).order("created_at", { ascending: false });
      }
    } else {
      result = await supabase.from("supplier_orders").select(SELECT).order("created_at", { ascending: false });
    }

    const { data, error } = result;
    if (error) setError(error.message);
    else setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load(searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (lastLoadedSearch.current === searchQuery) return;
    lastLoadedSearch.current = searchQuery;
    const timer = setTimeout(() => load(searchQuery), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, rows.length]);

  const { pageItems, totalPages, safePage } = paginate(rows, page, PAGE_SIZE);

  async function handleReceive(row) {
    setReceivingId(row.id);
    const { error } = await supabase.rpc("receive_supplier_order", { p_order_id: row.id });
    setReceivingId(null);
    if (error) setError(error.message);
    load(searchQuery);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem" }}>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add order
        </Button>
      </div>

      {error && <div style={{ color: "var(--a-danger)", fontSize: "14.5px", marginBottom: "10px" }}>{error}</div>}

      {loading ? (
        <SkeletonCardGrid count={PAGE_SIZE} minWidth={300} cardHeight={200} />
      ) : rows.length === 0 ? (
        <div style={{ ...cardStyle, padding: "2rem", textAlign: "center", color: "var(--a-text-3)" }}>No supplier orders yet.</div>
      ) : (
        <>
        <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))" }}>
          {pageItems.map((r) => {
            const received = r.status === "received";
            return (
              <div key={r.id} style={{ ...cardStyle, overflow: "hidden" }}>
                {/* Status is the dominant visual element — a full-width band */}
                <div
                  style={{
                    background: received ? "linear-gradient(135deg, #22c55e, #15803d)" : "var(--a-stage-active)",
                    color: "#fff",
                    padding: "12px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    fontSize: "15px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {received ? <PackageCheck size={16} /> : <Clock size={16} />}
                  {received ? "Received" : "Ordered"}
                </div>

                <div style={{ padding: "1.4rem 1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: `color-mix(in srgb, ${ACCENT} 16%, transparent)`,
                        color: ACCENT,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Truck size={19} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: "19px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r.raw_materials?.name || "—"}
                      </div>
                      <div style={{ fontSize: "14.5px", fontWeight: 600, color: "var(--a-text-2)" }}>Qty ordered: {r.order_quantity}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 600, color: "var(--a-text-2)", marginBottom: "14px" }}>
                    <Building2 size={13} /> {r.companies?.name || "—"}
                  </div>

                  {received ? (
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--a-text-3)" }}>
                      Received {r.received_at ? formatDate(r.received_at.slice(0, 10)) : ""}
                    </div>
                  ) : (
                    <Button onClick={() => handleReceive(r)} disabled={receivingId === r.id} style={{ width: "100%" }}>
                      <PackageCheck size={16} /> {receivingId === r.id ? "Receiving…" : "Mark received"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {modalOpen && <AddSupplierOrderModal onClose={() => setModalOpen(false)} onCreated={() => load(searchQuery)} />}
    </div>
  );
}

function AddSupplierOrderModal({ onClose, onCreated }) {
  const [materials, setMaterials] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({ raw_material_id: "", company_id: "", order_quantity: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    supabase.from("raw_materials").select("id, name").order("name").then(({ data }) => setMaterials(data || []));
    supabase.from("companies").select("id, name").eq("is_supplier", true).order("name").then(({ data }) => setCompanies(data || []));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    const qty = Number(form.order_quantity);
    if (!form.raw_material_id) {
      setFormError("Select a raw material");
      setSaving(false);
      return;
    }
    if (!form.company_id) {
      setFormError("Select a supplier company");
      setSaving(false);
      return;
    }
    if (!qty || qty <= 0) {
      setFormError("Order quantity must be greater than zero");
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("supplier_orders").insert({
      raw_material_id: form.raw_material_id,
      company_id: form.company_id,
      order_quantity: qty,
    });
    setSaving(false);
    if (error) {
      setFormError(error.message);
      return;
    }
    onCreated();
    onClose();
  }

  return (
    <Modal title="Add supplier order" icon={Truck} accent={ACCENT} onClose={onClose}>
      <form onSubmit={handleSave}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Company (supplier) *</label>
          <Dropdown
            value={form.company_id}
            onChange={(val) => setForm((v) => ({ ...v, company_id: val }))}
            options={companies.map((c) => ({ value: c.id, label: c.name }))}
            required
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Raw material *</label>
          <Dropdown
            value={form.raw_material_id}
            onChange={(val) => setForm((v) => ({ ...v, raw_material_id: val }))}
            options={materials.map((m) => ({ value: m.id, label: m.name }))}
            required
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Order quantity *</label>
          <input
            type="number"
            min="0.01"
            step="any"
            value={form.order_quantity}
            onChange={(e) => setForm((v) => ({ ...v, order_quantity: e.target.value }))}
            required
            style={{ width: "100%" }}
          />
        </div>

        {formError && <div style={{ color: "var(--a-danger)", fontSize: "14.5px", marginBottom: "1rem" }}>{formError}</div>}

        <Button type="submit" disabled={saving} style={{ width: "100%" }}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </form>
    </Modal>
  );
}
