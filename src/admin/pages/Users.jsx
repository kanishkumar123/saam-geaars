import { useEffect, useState } from "react";
import { Plus, UserRound, ShieldCheck, HardHat } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { usePageTitle, useAdminUI } from "../context/AdminUIContext";
import Modal from "../components/Modal";
import Dropdown from "../components/Dropdown";
import Button from "../components/Button";
import Pagination, { paginate } from "../components/Pagination";
import { SkeletonCardGrid } from "../components/Skeleton";
import { labelStyle, cardStyle } from "../components/masters/adminUiStyles";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" },
];

const ACCENT = "#db2777";
const PAGE_SIZE = 9;

export default function Users() {
  usePageTitle("Users");
  const { searchQuery } = useAdminUI();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = searchQuery.trim()
    ? rows.filter((r) =>
        [r.username, r.full_name, r.email].filter(Boolean).some((v) => v.toLowerCase().includes(searchQuery.trim().toLowerCase())),
      )
    : rows;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, rows.length]);

  const { pageItems, totalPages, safePage } = paginate(filtered, page, PAGE_SIZE);

  async function updateRole(row, role) {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", row.id);
    if (error) setError(error.message);
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem" }}>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add user
        </Button>
      </div>

      {error && <div style={{ color: "var(--a-danger)", fontSize: "14.5px", marginBottom: "10px" }}>{error}</div>}

      {loading ? (
        <SkeletonCardGrid count={PAGE_SIZE} minWidth={280} cardHeight={220} />
      ) : filtered.length === 0 ? (
        <div style={{ ...cardStyle, padding: "2rem", textAlign: "center", color: "var(--a-text-3)" }}>No users yet.</div>
      ) : (
        <>
        <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))" }}>
          {pageItems.map((r) => {
            const isAdminRole = r.role === "admin";
            return (
              <div key={r.id} style={{ ...cardStyle, padding: "1.5rem", textAlign: "center" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: isAdminRole ? "var(--a-brand-grad)" : `color-mix(in srgb, ${ACCENT} 16%, transparent)`,
                    color: isAdminRole ? "#fff" : ACCENT,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px",
                  }}
                >
                  <UserRound size={28} />
                </div>
                <div style={{ fontWeight: 800, fontSize: "18px", marginBottom: "3px" }}>{r.username || r.full_name}</div>
                <div style={{ fontSize: "14.5px", fontWeight: 600, color: "var(--a-text-2)", marginBottom: "14px" }}>{r.email}</div>

                {/* Role is the dominant visual element on this card */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: "12px",
                    background: isAdminRole ? "var(--a-brand-tint)" : `color-mix(in srgb, ${ACCENT} 14%, transparent)`,
                    color: isAdminRole ? "var(--a-brand)" : ACCENT,
                  }}
                >
                  {isAdminRole ? <ShieldCheck size={13} /> : <HardHat size={13} />}
                  {r.role}
                </div>

                <Dropdown value={r.role} onChange={(val) => updateRole(r, val)} options={ROLE_OPTIONS} size="sm" />
              </div>
            );
          })}
        </div>
        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {modalOpen && <AddUserModal onClose={() => setModalOpen(false)} onCreated={load} />}
    </div>
  );
}

function AddUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ full_name: "", username: "", email: "", password: "", role: "staff" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    if (!form.username.trim()) {
      setFormError("Username is required");
      setSaving(false);
      return;
    }
    if (form.password.length < 6) {
      setFormError("Password must be at least 6 characters");
      setSaving(false);
      return;
    }

    const { data, error } = await supabase.functions.invoke("create-user", {
      body: {
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        username: form.username.trim(),
        full_name: form.full_name.trim() || form.username.trim(),
      },
    });

    setSaving(false);
    if (error) {
      setFormError(data?.error || error.message);
      return;
    }
    onCreated();
    onClose();
  }

  return (
    <Modal title="Add user" icon={UserRound} accent={ACCENT} onClose={onClose}>
      <form onSubmit={handleSave}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Username *</label>
          <input value={form.username} onChange={(e) => setForm((v) => ({ ...v, username: e.target.value }))} required style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Full name</label>
          <input value={form.full_name} onChange={(e) => setForm((v) => ({ ...v, full_name: e.target.value }))} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Email *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Password *</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Role *</label>
          <Dropdown value={form.role} onChange={(val) => setForm((v) => ({ ...v, role: val }))} options={ROLE_OPTIONS} required />
        </div>

        {formError && <div style={{ color: "var(--a-danger)", fontSize: "14.5px", marginBottom: "1rem" }}>{formError}</div>}

        <Button type="submit" disabled={saving} style={{ width: "100%" }}>
          {saving ? "Creating…" : "Create account"}
        </Button>
      </form>
    </Modal>
  );
}
