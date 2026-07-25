// ═══════════════════════════════════════════════════════════
// GoogleMapGrainDivider.jsx  — GoogleMap, GrainOverlay, SectionDivider
// ═══════════════════════════════════════════════════════════

// ── GoogleMap ─────────────────────────────────────────────
export function GoogleMap() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        borderRadius: "14px",
        overflow: "hidden",
        border: "1px solid var(--border-1)",
        height: "280px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 10,
          borderRadius: "14px",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.08)",
        }}
      />
      <iframe
        title="Saam Geaars Location"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.3083166508013!2d77.05220067600749!3d11.01547825473691!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba85790b9429855%3A0xf933399e045a9514!2sSaam%20Geaars!5e0!3m2!1sen!2sin!4v1777043349017!5m2!1sen!2sin"
        width="100%"
        height="100%"
        style={{ border: 0, display: "block" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div
        style={{
          position: "absolute",
          bottom: "12px",
          left: "12px",
          zIndex: 20,
          background: "var(--bg-card)",
          border: "1px solid var(--border-1)",
          borderRadius: "10px",
          padding: "10px 14px",
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            color: "var(--text-1)",
            fontSize: "14px",
            fontWeight: 700,
            margin: 0,
          }}
        >
          Saam Geaars
        </p>
        <p
          style={{
            color: "var(--text-3)",
            fontSize: "12px",
            margin: "2px 0 0",
          }}
        >
          Ondipudur, Coimbatore — 641 016
        </p>
      </div>
    </div>
  );
}

// ── GrainOverlay ──────────────────────────────────────────
export function GrainOverlay({ opacity = 0.025 }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        opacity,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
      >
        <filter id="grain-f">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-f)" />
      </svg>
    </div>
  );
}

// ── SectionDivider ────────────────────────────────────────
function gearPathStr(cx, cy, teeth, outerR, innerR) {
  const pts = teeth * 4;
  const step = (Math.PI * 2) / pts;
  let d = "";
  for (let i = 0; i < pts; i++) {
    const isOuter = i % 4 === 1 || i % 4 === 2;
    const r = isOuter ? outerR : innerR;
    const a = i * step - Math.PI / 2;
    d +=
      (i === 0 ? "M" : "L") +
      `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)} `;
  }
  return d + "Z";
}

export function SectionDivider({ label = "" }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "12px 24px",
        maxWidth: "1280px",
        margin: "0 auto",
      }}
      aria-hidden="true"
    >
      <div style={{ flex: 1, borderTop: "1px dashed var(--border-1)" }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexShrink: 0,
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          style={{ animation: "divSpin 12s linear infinite" }}
        >
          <path
            d={gearPathStr(18, 18, 10, 13, 9)}
            fill="none"
            stroke="var(--brand)"
            strokeWidth="1.5"
            opacity="0.4"
          />
          <circle
            cx="18"
            cy="18"
            r="3.5"
            fill="none"
            stroke="var(--brand)"
            strokeWidth="1.5"
            opacity="0.4"
          />
        </svg>
        {label && (
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
            }}
          >
            {label}
          </span>
        )}
      </div>
      <div style={{ flex: 1, borderTop: "1px dashed var(--border-1)" }} />
      <style>{`@keyframes divSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default GoogleMap;
