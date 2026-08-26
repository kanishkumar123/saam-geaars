// Small read-only pill badge — shared by the Companies card (Client/Supplier
// flags) and the Job Card tile (company's Client/Supplier flags), so the
// same visual language is used for company status everywhere it appears.
export default function FlagBadge({ label, color = "var(--a-brand)", tint = "var(--a-brand-tint)" }) {
  return (
    <span
      style={{
        fontSize: "12px",
        fontWeight: 700,
        color,
        background: tint,
        padding: "4px 10px",
        borderRadius: "999px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
