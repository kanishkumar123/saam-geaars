// Shared circular progress ring — used as the focal graphic on the job
// card list, showing X of N stages complete. Defaults are tuned for sitting
// on top of a photo/scrim background (white-ish track, high-contrast fill,
// white text) rather than a plain theme surface.
export default function ProgressRing({
  value,
  max,
  size = 64,
  stroke = 6,
  color = "#facc15",
  trackColor = "rgba(255,255,255,0.28)",
  textColor = "#fff",
}) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const ratio = max > 0 ? value / max : 0;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: size * 0.26, fontWeight: 800, color: textColor, lineHeight: 1, textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}>{value}</span>
        <span style={{ fontSize: size * 0.14, color: textColor, opacity: 0.85, lineHeight: 1, textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}>/ {max}</span>
      </div>
    </div>
  );
}
