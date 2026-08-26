import { motion } from "framer-motion";

// Small labeled checkbox with a check-draw + scale pop transition — used
// wherever a boolean flag needs a quick, tactile on/off control rather than
// a static pill badge.
export default function AnimatedCheckbox({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: "none",
        border: "none",
        padding: "2px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <motion.span
        initial={false}
        animate={{ scale: checked ? [1, 1.15, 1] : 1, backgroundColor: checked ? "var(--a-brand)" : "var(--a-card)" }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "17px",
          height: "17px",
          borderRadius: "5px",
          border: `2px solid ${checked ? "var(--a-brand)" : "var(--a-border)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <motion.svg width="11" height="9" viewBox="0 0 11 9" fill="none">
          <motion.path
            d="M1 4.5L4 7.5L10 1"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        </motion.svg>
      </motion.span>
      <span style={{ fontSize: "13px", fontWeight: 700, color: checked ? "var(--a-text-1)" : "var(--a-text-3)" }}>{label}</span>
    </button>
  );
}
