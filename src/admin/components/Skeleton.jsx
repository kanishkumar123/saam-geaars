// Shared loading placeholders — pulsing blocks matching the theme surface,
// used for initial loads and page-to-page transitions everywhere.
export function SkeletonBlock({ width = "100%", height = "16px", radius = "6px", style }) {
  return <div className="admin-skeleton" style={{ width, height, borderRadius: radius, ...style }} />;
}

export function SkeletonCardGrid({ count = 6, minWidth = 280, cardHeight = 140 }) {
  return (
    <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: `repeat(auto-fill, minmax(min(${minWidth}px, 100%), 1fr))` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            background: "var(--a-card)",
            border: "1px solid var(--a-border)",
            borderRadius: "var(--a-radius-card)",
            padding: "1.5rem",
            height: cardHeight,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <SkeletonBlock width="60%" height="18px" />
          <SkeletonBlock width="40%" height="13px" />
          <div style={{ flex: 1 }} />
          <SkeletonBlock width="30%" height="13px" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonRows({ count = 6, columns = 4 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: "24px", padding: "14px 16px", borderBottom: "1px solid var(--a-border)" }}>
          {Array.from({ length: columns }).map((__, j) => (
            <SkeletonBlock key={j} width={j === 0 ? "160px" : "90px"} height="13px" />
          ))}
        </div>
      ))}
    </div>
  );
}
