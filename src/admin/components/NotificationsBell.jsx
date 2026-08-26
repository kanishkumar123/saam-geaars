import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, AlertTriangle, CalendarClock, X } from "lucide-react";
import { supabase, STAGE_LABELS } from "../lib/supabaseClient";
import { daysUntil, DUE_SOON_DAYS } from "../lib/dateUtils";

const DISMISSED_KEY = "saam-admin-dismissed-notifs";

function loadDismissed() {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function saveDismissed(set) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
}

// Admin-only notifications: stages marked Not completed, and job cards
// nearing their due date (same due-soon threshold as the Dashboard).
// Individually dismissible (and clearable all at once) — dismissal is keyed
// per-notification and persisted in localStorage so cleared items don't
// reappear on next load, even though the underlying lists are recomputed
// from live data every time the bell opens.
export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notCompleted, setNotCompleted] = useState([]);
  const [dueSoon, setDueSoon] = useState([]);
  const [dismissed, setDismissed] = useState(loadDismissed);
  const rootRef = useRef(null);

  async function load() {
    const { data } = await supabase
      .from("job_cards")
      .select("id, order_due_date, tasks(part_number), job_card_stages(stage_order, stage_type, status, remarks)");
    if (!data) return;

    const notCompletedList = [];
    const dueSoonList = [];
    for (const jc of data) {
      const stages = jc.job_card_stages || [];
      for (const s of stages) {
        if (s.status === "not_completed") {
          notCompletedList.push({
            key: `nc-${jc.id}-${s.stage_type}`,
            jobCardId: jc.id,
            partNumber: jc.tasks?.part_number,
            stageType: s.stage_type,
            remarks: s.remarks,
          });
        }
      }
      const remaining = daysUntil(jc.order_due_date);
      const isFullyDone = stages.length > 0 && stages.every((s) => s.status === "completed");
      if (!isFullyDone && remaining !== null && remaining <= DUE_SOON_DAYS) {
        dueSoonList.push({ key: `ds-${jc.id}`, jobCardId: jc.id, partNumber: jc.tasks?.part_number, remaining });
      }
    }
    setNotCompleted(notCompletedList);
    setDueSoon(dueSoonList);
  }

  useEffect(() => {
    load();
  }, []);

  function dismiss(key) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(key);
      saveDismissed(next);
      return next;
    });
  }

  function clearAll() {
    setDismissed((prev) => {
      const next = new Set(prev);
      visibleNotCompleted.forEach((n) => next.add(n.key));
      visibleDueSoon.forEach((n) => next.add(n.key));
      saveDismissed(next);
      return next;
    });
  }

  const visibleNotCompleted = notCompleted.filter((n) => !dismissed.has(n.key));
  const visibleDueSoon = dueSoon.filter((n) => !dismissed.has(n.key));

  useEffect(() => {
    function handleClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const total = visibleNotCompleted.length + visibleDueSoon.length;

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) load();
        }}
        aria-label="Notifications"
        style={{
          position: "relative",
          background: "var(--a-bg-elevated)",
          border: "1px solid var(--a-border)",
          borderRadius: "8px",
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--a-text-2)",
          flexShrink: 0,
        }}
      >
        <Bell size={16} />
        {total > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              minWidth: "16px",
              height: "16px",
              padding: "0 3px",
              borderRadius: "999px",
              background: "var(--a-danger)",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.16 }}
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              width: "340px",
              maxHeight: "420px",
              overflowY: "auto",
              background: "var(--a-card)",
              border: "1px solid var(--a-border)",
              borderRadius: "var(--a-radius-card)",
              boxShadow: "var(--a-shadow-lg)",
              zIndex: 100,
              padding: "10px",
            }}
          >
            {total === 0 ? (
              <div style={{ padding: "1.5rem", textAlign: "center", fontSize: "13.5px", color: "var(--a-text-3)" }}>No notifications</div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "2px 4px 6px" }}>
                  <button
                    onClick={clearAll}
                    style={{ background: "none", border: "none", color: "var(--a-brand)", fontSize: "12.5px", fontWeight: 700, cursor: "pointer", padding: "2px 4px" }}
                  >
                    Clear all
                  </button>
                </div>
                {visibleNotCompleted.length > 0 && (
                  <>
                    <SectionLabel>Not completed</SectionLabel>
                    {visibleNotCompleted.map((n) => (
                      <NotifRow
                        key={n.key}
                        to={`/admin/job-cards/${n.jobCardId}`}
                        onClick={() => setOpen(false)}
                        onDismiss={() => dismiss(n.key)}
                        icon={AlertTriangle}
                        iconColor="var(--a-danger)"
                        text={`${n.partNumber} — ${STAGE_LABELS[n.stageType]} not completed`}
                        subtext={n.remarks}
                      />
                    ))}
                  </>
                )}
                {visibleDueSoon.length > 0 && (
                  <>
                    <SectionLabel>Due soon</SectionLabel>
                    {visibleDueSoon.map((n) => (
                      <NotifRow
                        key={n.key}
                        to={`/admin/job-cards/${n.jobCardId}`}
                        onClick={() => setOpen(false)}
                        onDismiss={() => dismiss(n.key)}
                        icon={CalendarClock}
                        iconColor="#d97706"
                        text={n.remaining < 0 ? `${n.partNumber} — ${Math.abs(n.remaining)}d overdue` : `${n.partNumber} — due in ${n.remaining}d`}
                      />
                    ))}
                  </>
                )}
              </>
            )}
            <style>{`
              .admin-notif-row:hover { background: var(--a-bg-elevated); }
              .admin-notif-dismiss:hover { background: var(--a-border); color: var(--a-text-1); }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--a-text-3)", padding: "8px 8px 4px" }}>
      {children}
    </div>
  );
}

function NotifRow({ to, icon: Icon, iconColor, text, subtext, onClick, onDismiss }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "2px" }} className="admin-notif-row">
      <Link
        to={to}
        onClick={onClick}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          padding: "9px 8px",
          borderRadius: "8px",
          textDecoration: "none",
          color: "var(--a-text-1)",
          fontSize: "13.5px",
          fontWeight: 600,
          flex: 1,
          minWidth: 0,
        }}
      >
        <Icon size={15} color={iconColor} style={{ flexShrink: 0, marginTop: "2px" }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{text}</div>
          {subtext && (
            <div
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--a-text-3)",
                lineHeight: 1.35,
                marginTop: "2px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {subtext}
            </div>
          )}
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDismiss();
        }}
        aria-label="Dismiss notification"
        style={{
          background: "none",
          border: "none",
          color: "var(--a-text-3)",
          cursor: "pointer",
          padding: "6px",
          borderRadius: "6px",
          display: "flex",
          flexShrink: 0,
        }}
        className="admin-notif-dismiss"
      >
        <X size={13} />
      </button>
    </div>
  );
}
