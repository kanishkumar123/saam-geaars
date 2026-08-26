import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays } from "lucide-react";
import "react-day-picker/style.css";

function toISO(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fromISO(iso) {
  if (!iso) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

// Displays DD/MM/YYYY, stores/emits an ISO "YYYY-MM-DD" string (same shape
// as a native <input type="date"> value) so it's a drop-in replacement
// anywhere a date is picked in the app.
export function formatDisplayDate(iso) {
  const date = fromISO(iso);
  if (!date) return "";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}

const thisYear = new Date().getFullYear();

export default function DatePicker({ value, onChange, disabled = false, required = false, placeholder = "Select date" }) {
  const [open, setOpen] = useState(false);
  // Popup is portaled and fixed-positioned against the viewport (not the
  // trigger's offset parent) so it can never be clipped by a modal's
  // overflow:auto, and can flip above the field when there isn't enough
  // room below — collision-aware rather than always dropping down.
  const [coords, setCoords] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const popupRef = useRef(null);
  const selected = fromISO(value);

  useEffect(() => {
    function handleClick(e) {
      if (rootRef.current && rootRef.current.contains(e.target)) return;
      if (popupRef.current && popupRef.current.contains(e.target)) return;
      setOpen(false);
    }
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    function place() {
      const rect = triggerRef.current.getBoundingClientRect();
      const popupHeight = popupRef.current?.offsetHeight || 360;
      const popupWidth = popupRef.current?.offsetWidth || 300;
      const gap = 8;

      const spaceBelow = window.innerHeight - rect.bottom;
      const openAbove = spaceBelow < popupHeight + gap && rect.top > popupHeight + gap;
      const top = openAbove ? rect.top - popupHeight - gap : rect.bottom + gap;

      const maxLeft = window.innerWidth - popupWidth - gap;
      const left = Math.max(gap, Math.min(rect.left, maxLeft));

      setCoords({ top: Math.max(gap, top), left, openAbove });
    }

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  const portalTarget = typeof document !== "undefined" ? document.getElementById("admin-portal-root") || document.body : null;

  return (
    <div ref={rootRef} style={{ position: "relative", width: "100%" }} className="admin-datepicker">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          background: "var(--a-card)",
          color: selected ? "var(--a-text-1)" : "var(--a-text-3)",
          border: "2px solid var(--a-ctl-border)",
          borderRadius: "var(--a-ctl-radius)",
          padding: "12px 16px",
          minHeight: "46px",
          fontSize: "16px",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.55 : 1,
          textAlign: "left",
          fontFamily: "inherit",
          boxShadow: open ? "1px 1px 0 0 var(--a-ctl-shadow)" : "var(--a-ctl-offset) var(--a-ctl-offset) 0 0 var(--a-ctl-shadow)",
          transform: open ? "translate(1px, 1px)" : "none",
          transition: "transform 0.1s ease, box-shadow 0.1s ease",
        }}
      >
        <span>{selected ? formatDisplayDate(value) : placeholder}</span>
        <CalendarDays size={16} style={{ flexShrink: 0, opacity: 0.7 }} />
      </button>

      {required && (
        <input tabIndex={-1} value={value ?? ""} onChange={() => {}} required style={{ position: "absolute", opacity: 0, height: 0, width: "100%", pointerEvents: "none" }} />
      )}

      {open &&
        portalTarget &&
        createPortal(
          <AnimatePresence>
            <motion.div
              ref={popupRef}
              initial={{ opacity: 0, scale: 0.94, y: coords?.openAbove ? 6 : -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: coords?.openAbove ? 4 : -4 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "fixed",
                top: coords?.top ?? -9999,
                left: coords?.left ?? -9999,
                visibility: coords ? "visible" : "hidden",
                zIndex: 200,
                transformOrigin: coords?.openAbove ? "bottom" : "top",
                background: "var(--a-card)",
                border: "2px solid var(--a-ctl-border)",
                borderRadius: "var(--a-ctl-radius)",
                boxShadow: "var(--a-ctl-offset) var(--a-ctl-offset) 0 0 var(--a-ctl-shadow)",
                padding: "10px",
              }}
              className="admin-datepicker"
            >
              <DayPicker
                mode="single"
                selected={selected}
                onSelect={(date) => {
                  if (date) onChange(toISO(date));
                  setOpen(false);
                }}
                defaultMonth={selected}
                captionLayout="dropdown"
                startMonth={new Date(thisYear - 15, 0)}
                endMonth={new Date(thisYear + 10, 11)}
              />
            </motion.div>
          </AnimatePresence>,
          portalTarget,
        )}
    </div>
  );
}
