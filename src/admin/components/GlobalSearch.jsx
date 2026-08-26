import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ClipboardList, Building2, FolderKanban, Hash, Boxes, UserRound } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

// True cross-app search — lives only on the Dashboard. Queries every data
// type in parallel and renders grouped suggestions; picking one navigates
// straight to that record (job cards go to their own detail page, every
// other type goes to its list page since those don't have per-record routes).
export default function GlobalSearch() {
  const { isAdmin } = useAuth();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const rootRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function runSearch(q) {
    const like = `%${q}%`;

    // Job cards need a broader net than a single .or() on a joined table can
    // express cleanly (part number OR PO number OR company name) — fetch a
    // reasonably-sized page and filter client-side instead.
    const [companiesRes, projectsRes, tasksRes, materialsRes, usersRes, jcRes] = await Promise.all([
      supabase.from("companies").select("id, name, contact_person").ilike("name", like).limit(5),
      supabase.from("projects").select("id, po_number").ilike("po_number", like).limit(5),
      supabase.from("tasks").select("id, part_number, item_description").or(`part_number.ilike.${like},item_description.ilike.${like}`).limit(5),
      supabase.from("raw_materials").select("id, name").ilike("name", like).limit(5),
      isAdmin
        ? supabase.from("profiles").select("id, username, full_name, email").or(`username.ilike.${like},full_name.ilike.${like},email.ilike.${like}`).limit(5)
        : Promise.resolve({ data: [] }),
      supabase.from("job_cards").select("id, tasks(part_number, item_description), projects(po_number), companies(name)").limit(200),
    ]);

    const needle = q.toLowerCase();
    const jobCards = (jcRes.data || [])
      .filter((jc) =>
        [jc.tasks?.part_number, jc.tasks?.item_description, jc.projects?.po_number, jc.companies?.name]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(needle)),
      )
      .slice(0, 5);

    setResults({
      jobCards,
      companies: companiesRes.data || [],
      projects: projectsRes.data || [],
      tasks: tasksRes.data || [],
      materials: materialsRes.data || [],
      users: usersRes.data || [],
    });
    setLoading(false);
  }

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => runSearch(q), 280);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function go(path) {
    navigate(path);
    setOpen(false);
    setQuery("");
    setResults(null);
  }

  const totalResults = results
    ? results.jobCards.length + results.companies.length + results.projects.length + results.tasks.length + results.materials.length + results.users.length
    : 0;

  return (
    <div ref={rootRef} style={{ position: "relative", width: "100%", maxWidth: "440px" }}>
      <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--a-text-3)", zIndex: 1 }} />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search job cards, companies, items, users…"
        style={{ width: "100%", paddingLeft: "38px", fontWeight: 500 }}
      />

      <AnimatePresence>
        {open && query.trim().length >= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              maxHeight: "60vh",
              overflowY: "auto",
              background: "var(--a-card)",
              border: "1px solid var(--a-border)",
              borderRadius: "var(--a-radius-card)",
              boxShadow: "var(--a-shadow-lg)",
              zIndex: 90,
              padding: "8px",
            }}
          >
            {loading && !results ? (
              <div style={{ padding: "1.25rem", textAlign: "center", fontSize: "13.5px", color: "var(--a-text-3)" }}>Searching…</div>
            ) : totalResults === 0 ? (
              <div style={{ padding: "1.25rem", textAlign: "center", fontSize: "13.5px", color: "var(--a-text-3)" }}>No results for "{query.trim()}"</div>
            ) : (
              <>
                <ResultGroup label="Job cards" icon={ClipboardList}>
                  {results.jobCards.map((jc) => (
                    <ResultRow
                      key={jc.id}
                      onClick={() => go(`/admin/job-cards/${jc.id}`)}
                      title={jc.tasks?.part_number || "Job card"}
                      subtitle={[jc.projects?.po_number, jc.companies?.name].filter(Boolean).join(" · ")}
                    />
                  ))}
                </ResultGroup>
                <ResultGroup label="Companies" icon={Building2}>
                  {results.companies.map((c) => (
                    <ResultRow key={c.id} onClick={() => go("/admin/companies")} title={c.name} subtitle={c.contact_person} />
                  ))}
                </ResultGroup>
                <ResultGroup label="Purchase orders" icon={FolderKanban}>
                  {results.projects.map((p) => (
                    <ResultRow key={p.id} onClick={() => go("/admin/projects")} title={p.po_number} />
                  ))}
                </ResultGroup>
                <ResultGroup label="Items" icon={Hash}>
                  {results.tasks.map((t) => (
                    <ResultRow key={t.id} onClick={() => go("/admin/tasks")} title={t.part_number} subtitle={t.item_description} />
                  ))}
                </ResultGroup>
                <ResultGroup label="Raw materials" icon={Boxes}>
                  {results.materials.map((m) => (
                    <ResultRow key={m.id} onClick={() => go("/admin/raw-materials")} title={m.name} />
                  ))}
                </ResultGroup>
                {isAdmin && (
                  <ResultGroup label="Users" icon={UserRound}>
                    {results.users.map((u) => (
                      <ResultRow key={u.id} onClick={() => go("/admin/users")} title={u.username || u.full_name} subtitle={u.email} />
                    ))}
                  </ResultGroup>
                )}
              </>
            )}
            <style>{`.admin-search-row:hover { background: var(--a-bg-elevated); }`}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultGroup({ label, icon: Icon, children }) {
  if (!children || (Array.isArray(children) && children.length === 0)) return null;
  return (
    <div style={{ marginBottom: "4px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--a-text-3)",
          padding: "6px 8px 4px",
        }}
      >
        <Icon size={12} /> {label}
      </div>
      {children}
    </div>
  );
}

function ResultRow({ onClick, title, subtitle }) {
  return (
    <button
      onClick={onClick}
      className="admin-search-row"
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        background: "none",
        border: "none",
        padding: "8px 8px",
        borderRadius: "8px",
        cursor: "pointer",
        color: "var(--a-text-1)",
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title || "—"}</div>
      {subtitle && (
        <div style={{ fontSize: "12.5px", color: "var(--a-text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subtitle}</div>
      )}
    </button>
  );
}
