import { STATUS_LABELS } from "../lib/supabaseClient";

const statusStyles = {
  acquired: { background: "var(--a-stage-pending-fill)", border: "1px solid var(--a-stage-pending-border)", color: "var(--a-text-2)" },
  on_process: { background: "var(--a-stage-active)", border: "none", color: "#fff" },
  completed: { background: "var(--a-stage-complete)", border: "none", color: "#fff" },
  not_completed: { background: "transparent", border: "1px solid var(--a-stage-blocked)", color: "var(--a-stage-blocked)" },
};

export default function StageStatusPill({ status, size = "sm" }) {
  const style = statusStyles[status] || statusStyles.acquired;
  return (
    <span
      style={{
        ...style,
        display: "inline-block",
        fontSize: size === "sm" ? "11px" : "12.5px",
        fontWeight: 700,
        padding: size === "sm" ? "2px 9px" : "4px 12px",
        borderRadius: "999px",
        whiteSpace: "nowrap",
      }}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
