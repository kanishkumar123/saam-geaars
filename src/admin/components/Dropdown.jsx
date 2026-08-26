import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

// Shared custom dropdown — replaces native <select> everywhere. Trigger
// shell uses the same neobrutalist border+offset-shadow language as inputs
// and buttons; the menu's open/close timing (scale + opacity, ~0.2s) is
// adapted from reactbits.dev's AnimatedList entrance transition.
export default function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
  required = false,
  size = "md",
  style,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const small = size === "sm";

  useEffect(() => {
    function handleClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
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

  const selected = options.find((o) => String(o.value) === String(value));

  return (
    <div ref={rootRef} style={{ position: "relative", width: "100%", ...style }}>
      <button
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
          borderRadius: small ? "8px" : "var(--a-ctl-radius)",
          padding: small ? "6px 10px" : "12px 16px",
          minHeight: small ? "34px" : "44px",
          fontSize: small ? "12.5px" : "14px",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.55 : 1,
          textAlign: "left",
          fontFamily: "inherit",
          boxShadow: open
            ? "1px 1px 0 0 var(--a-ctl-shadow)"
            : "var(--a-ctl-offset) var(--a-ctl-offset) 0 0 var(--a-ctl-shadow)",
          transform: open ? "translate(1px, 1px)" : "none",
          transition: "transform 0.1s ease, box-shadow 0.1s ease",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={small ? 13 : 15} style={{ flexShrink: 0, transition: "transform 0.18s ease", transform: open ? "rotate(180deg)" : "none", opacity: 0.7 }} />
      </button>

      {/* Hidden input keeps native form `required` validation working */}
      {required && (
        <input tabIndex={-1} value={value ?? ""} onChange={() => {}} required style={{ position: "absolute", opacity: 0, height: 0, width: "100%", pointerEvents: "none" }} />
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              zIndex: 80,
              transformOrigin: "top",
              background: "var(--a-card)",
              border: "2px solid var(--a-ctl-border)",
              borderRadius: "var(--a-ctl-radius)",
              boxShadow: "var(--a-ctl-offset) var(--a-ctl-offset) 0 0 var(--a-ctl-shadow)",
              padding: "5px",
              maxHeight: "260px",
              overflowY: "auto",
            }}
          >
            {options.length === 0 && (
              <div style={{ padding: "10px 12px", fontSize: "14.5px", color: "var(--a-text-3)" }}>No options</div>
            )}
            {options.map((o) => {
              const isSelected = String(o.value) === String(value);
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    padding: "9px 11px",
                    fontSize: "15.5px",
                    border: "none",
                    borderRadius: "7px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                    background: isSelected ? "var(--a-brand-tint)" : "transparent",
                    color: isSelected ? "var(--a-brand)" : "var(--a-text-1)",
                    fontWeight: isSelected ? 700 : 400,
                  }}
                  className="admin-dd-option"
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.label}</span>
                  {isSelected && <Check size={14} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`.admin-dd-option:hover { background: var(--a-bg-elevated) !important; }`}</style>
    </div>
  );
}
