// IndustryMarqueeAndStatsBanner.jsx — gear/gearbox industry terms only
import AnimatedCounter from "./AnimatedCounter";
import FadeIn from "./FadeIn";

// ── MARQUEE ─────────────────────────────────────────────────────────
export function IndustryMarquee() {
  const terms = [
    "Helical Gears",
    "Worm Gearboxes",
    "Spur Gears",
    "Bevel Gears",
    "CNC Machining",
    "Sprockets",
    "Profile Grinding",
    "Rack & Pinion",
    "Planetary Gears",
    "Heat Treatment",
    "Girth Gears",
    "5-Axis Milling",
    "Worm Wheels",
    "Gear Hobbing",
    "Roller Chains",
  ];
  const doubled = [...terms, ...terms];

  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        borderTop: "1px solid var(--border-1)",
        borderBottom: "1px solid var(--border-1)",
        background: "var(--bg-elevated)",
        padding: "13px 0",
        position: "relative",
        transition: "background 0.4s",
      }}
      aria-label="Products and capabilities"
    >
      {/* Fade masks */}
      <div
        style={{
          position: "absolute",
          inset: "0",
          left: 0,
          width: "100px",
          zIndex: 10,
          pointerEvents: "none",
          background:
            "linear-gradient(to right, var(--bg-elevated), transparent)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "0",
          left: "auto",
          right: 0,
          width: "100px",
          zIndex: 10,
          pointerEvents: "none",
          background:
            "linear-gradient(to left, var(--bg-elevated), transparent)",
        }}
      />
      <div
        style={{
          display: "flex",
          whiteSpace: "nowrap",
          animation: "marqueeScroll 36s linear infinite",
        }}
      >
        {doubled.map((term, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: "13px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "var(--text-3)",
            }}
          >
            {term}
            <span
              style={{ margin: "0 22px", color: "var(--brand)", opacity: 0.45 }}
            >
              ·
            </span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marqueeScroll { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }`}</style>
    </div>
  );
}

// ── STATS BANNER ────────────────────────────────────────────────────
const STATS = [
  {
    value: 20,
    suffix: "+",
    prefix: "",
    label: "Years in Business",
    detail: "Est. 2001",
  },
  {
    value: 9500,
    suffix: "",
    prefix: "",
    label: "Sq Ft Facility",
    detail: "Ondipudur, Coimbatore",
  },
  {
    value: 300,
    suffix: " HP",
    prefix: "",
    label: "Max Gearbox Power",
    detail: "Single Unit Capacity",
  },
  {
    value: 200,
    suffix: "+",
    prefix: "",
    label: "Satisfied Clients",
    detail: "Across South India",
  },
];

export function StatsBanner() {
  return (
    <section
      style={{
        borderTop: "1px solid var(--border-1)",
        borderBottom: "1px solid var(--border-1)",
        background: "var(--bg-section)",
        padding: "5rem 1.5rem",
        transition: "background 0.4s",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "2.5rem",
        }}
        className="md:grid-cols-4"
      >
        {STATS.map((stat, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                  fontWeight: 900,
                  color: "var(--brand)",
                  letterSpacing: "-0.03em",
                  marginBottom: "6px",
                }}
              >
                <AnimatedCounter
                  to={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                />
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--text-1)",
                  marginBottom: "4px",
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontFamily: "monospace",
                  color: "var(--text-3)",
                }}
              >
                {stat.detail}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

export default IndustryMarquee;
