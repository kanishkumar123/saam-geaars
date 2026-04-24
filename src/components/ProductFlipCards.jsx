// ProductFlipCards.jsx  (violet, CSS-var themed, light/dark)
import { useState } from "react";
import { Cog, Factory, Settings } from "lucide-react";
import FadeIn from "./FadeIn";

const PRODUCTS = [
  {
    id: "gears", icon: Cog, name: "Precision Gears",
    tagline: "Module up to 30 · OD up to 3 m",
    front: ["Spur & Helical Gears","Worm and Worm Wheel","Bevel Gears","Rack & Pinion","Girth Gears","Hardened & Profile Ground"],
    back: [
      { label: "Module Range",   value: "1 – 30" },
      { label: "Max OD",         value: "3000 mm" },
      { label: "Accuracy Grade", value: "IS 3675 Gr 6–12" },
      { label: "Tolerance",      value: "±0.001 mm" },
      { label: "Materials",      value: "EN8, EN36, EN353, SS, Bronze" },
      { label: "Heat Treatment", value: "Carburizing, Case Hardening" },
      { label: "Surface Finish", value: "Hobbed / Shaved / Ground" },
      { label: "Standards",      value: "AGMA / IS / ISO / DIN" },
    ],
  },
  {
    id: "gearbox", icon: Factory, name: "Gear Box Units",
    tagline: "Power range up to 300 HP",
    front: ["Worm Reduction Gearboxes","Helical & Bevel Gearboxes","Geared Motors","Internal Gear Boxes","Worm Shafts & Wheels","Input Shafts & Spares"],
    back: [
      { label: "Power Range",  value: "0.5 – 300 HP" },
      { label: "Ratio Range",  value: "5:1 – 60:1" },
      { label: "Input Speed",  value: "Up to 3000 RPM" },
      { label: "Mounting",     value: "Foot / Flange / Hollow Shaft" },
      { label: "Housing",      value: "Cast Iron / Fabricated Steel" },
      { label: "Lubrication",  value: "Oil Splash / Forced" },
      { label: "Output Shaft", value: "Solid / Hollow with keyway" },
      { label: "Spares",       value: "Full availability" },
    ],
  },
  {
    id: "sprockets", icon: Settings, name: "Sprockets",
    tagline: "Pitch up to 10\" · OD up to 36\"",
    front: ["Standard Roller Chain","Conveyor (Forged Link)","Traction Wheel (Segmental)","Hub Types A, B, C & D","Simplex / Duplex / Triplex","ANSI / ASME / IS / ISO"],
    back: [
      { label: "Chain Pitch",  value: "3/8\" – 10\"" },
      { label: "Max OD",       value: "36 inches" },
      { label: "Bore Range",   value: "12 – 300 mm" },
      { label: "No. of Teeth", value: "6 – 120" },
      { label: "Materials",    value: "EN8, EN19, Cast Iron, MS" },
      { label: "Surface",      value: "Hardening / Black Oxide" },
      { label: "Keyway",       value: "Standard or custom" },
      { label: "Strand",       value: "Simplex / Duplex / Triplex" },
    ],
  },
];

function FlipCard({ product, delay }) {
  const [flipped, setFlipped] = useState(false);
  const Icon = product.icon;

  return (
    <FadeIn delay={delay}>
      <div
        style={{ position: "relative", width: "100%", height: "440px", perspective: "1200px", cursor: "pointer" }}
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
        onClick={() => setFlipped((v) => !v)}
        role="button" tabIndex={0}
        aria-label={`View ${product.name} specifications`}
        onKeyDown={(e) => e.key === "Enter" && setFlipped((v) => !v)}
      >
        <div style={{
          position: "absolute", inset: 0,
          transformStyle: "preserve-3d",
          transition: "transform 0.65s cubic-bezier(0.22,1,0.36,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}>

          {/* FRONT */}
          <div style={{
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            position: "absolute", inset: 0,
            background: "var(--bg-card)",
            border: "1px solid var(--border-1)",
            padding: "2rem 2rem 1.75rem",
            borderRadius: "16px",
            boxShadow: "var(--shadow)",
            display: "flex", flexDirection: "column",
            transition: "border-color 0.4s",
          }}>
            <Icon style={{ width: "44px", height: "44px", color: "var(--brand)", marginBottom: "1.5rem", transition: "transform 0.7s" }} strokeWidth={1.5} />
            <h3 style={{ fontSize: "22px", fontWeight: 900, textTransform: "uppercase", marginBottom: "4px", color: "var(--text-1)", letterSpacing: "-0.01em" }}>
              {product.name}
            </h3>
            <p style={{ color: "var(--brand)", fontSize: "14px", fontFamily: "monospace", marginBottom: "1.5rem" }}>{product.tagline}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
              {product.front.map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-2)", fontSize: "15px" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--brand)", opacity: 0.6, flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Hover for specs</span>
              <span style={{ color: "var(--brand)", fontSize: "18px" }}>→</span>
            </div>
          </div>

          {/* BACK */}
          <div style={{
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            position: "absolute", inset: 0,
            background: "var(--bg-elevated)",
            border: "1.5px solid var(--brand-border)",
            padding: "1.75rem 2rem",
            borderRadius: "16px",
            boxShadow: "var(--shadow-lg)",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-1)" }}>
              <Icon style={{ width: "18px", height: "18px", color: "var(--brand)" }} strokeWidth={1.5} />
              <h3 style={{ fontSize: "14px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-1)" }}>{product.name}</h3>
              <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Specs</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
              {product.back.map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border-1)" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{row.label}</span>
                  <span style={{ fontSize: "14px", fontFamily: "monospace", color: "var(--text-1)", textAlign: "right" }}>{row.value}</span>
                </div>
              ))}
            </div>

            <a href="#contact" onClick={(e) => e.stopPropagation()}
              style={{ marginTop: "1.25rem", display: "block", padding: "13px", background: "var(--brand)", color: "#fff", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", borderRadius: "10px", textDecoration: "none", transition: "background 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand)"; }}
            >
              Request a Quote
            </a>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

export default function ProductFlipCards() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.75rem" }}>
      {PRODUCTS.map((p, i) => <FlipCard key={p.id} product={p} delay={i * 0.1} />)}
    </div>
  );
}
