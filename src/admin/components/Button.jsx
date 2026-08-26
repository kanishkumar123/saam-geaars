// Shared button — variant system modeled after neobrutalism.dev's button.tsx
// (cva variants + border/offset-shadow that collapses on press), adapted to
// our ink/purple tokens. One component, swapped in everywhere a button
// needs the neobrutalist treatment.
export default function Button({ variant = "primary", size = "md", className = "", style, children, ...props }) {
  const classes = ["admin-btn", `admin-btn-${variant}`, size === "sm" ? "admin-btn-sm" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={classes} style={style} {...props}>
      {children}
    </button>
  );
}
