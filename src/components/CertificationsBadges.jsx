// CertificationsBadges.jsx
import { useState } from "react";
import FadeIn from "./FadeIn";
import { CheckCircle2, BadgeCheck } from "lucide-react";
import AnimatedHeading from "./AnimatedHeading";

const CERTIFICATIONS = [
  {
    id: 1,
    abbr: "BIS",
    sub: "Certified",
    title: "BIS Certified",
    org: "Bureau of Indian Standards",
    description:
      "Our products meet the quality and safety specifications mandated by the Bureau of Indian Standards the national body responsible for standardisation, testing, and certification across India's manufacturing sector.",
    checks: [
      "Product quality conformance",
      "IS standard compliance verified",
      "Third-party audit cleared",
    ],
  },
  {
    id: 2,
    abbr: "MSME",
    sub: "Registered",
    title: "MSME Registered",
    org: "Ministry of MSME, India",
    description:
      "Registered as a Micro Enterprise under the Ministry of MSME, Government of India qualifying us for government procurement programmes, priority sector schemes, and export promotion incentives.",
    checks: [
      "Udyam Registration active",
      "Eligible for govt. tenders",
      "Export promotion benefits",
    ],
  },
];

// ── Stamp seal component ─────────────────────────────────────────
function StampSeal({ abbr, sub, hovered }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100px",
        height: "100px",
        flexShrink: 0,
      }}
    >
      {/* Inner square — solid brand-muted fill */}
      <div
        style={{
          position: "absolute",
          inset: "8px",
          borderRadius: "14px",
          background: "var(--brand-muted)",
          border: `1px solid ${hovered ? "var(--brand)" : "var(--brand-border)"}`,
          transition: "border-color 0.3s, background 0.3s",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2px",
        }}
      >
        {/* Abbreviated text */}
        <span
          style={{
            fontSize: abbr.length > 3 ? "14px" : "18px",
            fontWeight: 900,
            color: "var(--brand)",
            letterSpacing: abbr.length > 3 ? "0.04em" : "0.06em",
            lineHeight: 1,
            transition: "color 0.3s",
          }}
        >
          {abbr}
        </span>

        {/* Micro dotted divider */}
        <div style={{ display: "flex", gap: "3px", margin: "2px 0" }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                background: "var(--brand)",
                opacity: hovered ? 0.8 : 0.35,
                transition: "opacity 0.3s",
              }}
            />
          ))}
        </div>

        {/* Sub label */}
        <span
          style={{
            fontSize: "8px",
            fontWeight: 700,
            color: "var(--brand)",
            opacity: 0.7,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          {sub}
        </span>
      </div>

      {/* Corner tick marks — top-left, top-right, bottom-left, bottom-right */}
      {[
        {
          top: 0,
          left: 0,
          borderTop: "2px solid",
          borderLeft: "2px solid",
          borderRadius: "4px 0 0 0",
        },
        {
          top: 0,
          right: 0,
          borderTop: "2px solid",
          borderRight: "2px solid",
          borderRadius: "0 4px 0 0",
        },
        {
          bottom: 0,
          left: 0,
          borderBottom: "2px solid",
          borderLeft: "2px solid",
          borderRadius: "0 0 0 4px",
        },
        {
          bottom: 0,
          right: 0,
          borderBottom: "2px solid",
          borderRight: "2px solid",
          borderRadius: "0 0 4px 0",
        },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: "10px",
            height: "10px",
            borderColor: hovered ? "var(--brand)" : "var(--border-2)",
            opacity: hovered ? 1 : 0.5,
            transition: "border-color 0.3s, opacity 0.3s",
            ...pos,
          }}
        />
      ))}
    </div>
  );
}

// ── Single cert card ──────────────────────────────────────────────
function CertCard({ cert, delay }) {
  const [hovered, setHovered] = useState(false);

  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          overflow: "hidden",
          background: "var(--bg-card)",
          border: `1px solid ${hovered ? "var(--brand-border)" : "var(--border-1)"}`,
          borderRadius: "22px",
          padding: "2.5rem",
          cursor: "default",
          boxShadow: hovered ? "var(--shadow-lg)" : "var(--shadow)",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          transition:
            "border-color 0.3s, box-shadow 0.35s, transform 0.35s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Shimmer on hover */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(120deg, transparent 30%, rgba(var(--brand-rgb),0.07) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
            backgroundPosition: hovered ? "-100% center" : "200% center",
            animation: hovered ? "certShimmer 0.65s ease forwards" : "none",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s",
          }}
        />

        {/* Ambient tint corner */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "200px",
            height: "200px",
            background:
              "radial-gradient(circle at top right, var(--brand-muted), transparent 70%)",
            pointerEvents: "none",
            opacity: hovered ? 1 : 0.4,
            transition: "opacity 0.4s",
          }}
        />

        {/* Verified pill */}
        <div
          style={{
            position: "absolute",
            top: "1.5rem",
            right: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "5px 12px",
            background: "rgba(34,197,94,0.10)",
            border: "1px solid rgba(34,197,94,0.22)",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 700,
            color: "#22c55e",
            letterSpacing: "0.05em",
          }}
        >
          <BadgeCheck style={{ width: "13px", height: "13px" }} />
          Verified
        </div>

        {/* Seal + title row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <StampSeal abbr={cert.abbr} sub={cert.sub} hovered={hovered} />
          <div>
            <p
              style={{
                fontSize: "28px",
                fontWeight: 900,
                color: "var(--text-1)",
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
                marginBottom: "6px",
              }}
            >
              {cert.title}
            </p>
            <p
              style={{
                fontSize: "15px",
                color: "var(--text-3)",
                fontWeight: 500,
              }}
            >
              {cert.org}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "var(--border-1)",
            marginBottom: "1.5rem",
          }}
        />

        {/* Description */}
        <p
          style={{
            fontSize: "16px",
            color: "var(--text-2)",
            lineHeight: 1.85,
            marginBottom: "1.5rem",
          }}
        >
          {cert.description}
        </p>

        {/* Check items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {cert.checks.map((check, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <CheckCircle2
                style={{
                  width: "17px",
                  height: "17px",
                  color: "#22c55e",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "15px",
                  color: "var(--text-2)",
                  fontWeight: 500,
                }}
              >
                {check}
              </span>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes certShimmer {
            0%   { background-position: 200% center }
            100% { background-position: -100% center }
          }
        `}</style>
      </div>
    </FadeIn>
  );
}

// ── Section ──────────────────────────────────────────────────────
export function CertificationsBadges() {
  return (
    <section
      style={{
        padding: "4rem 1.5rem",
        borderTop: "1px solid var(--border-1)",
        borderBottom: "1px solid var(--border-1)",
        transition: "background 0.4s",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Section title — same size/style as other section headings */}
        <FadeIn>
          <div style={{ marginBottom: "3.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  height: "2px",
                  width: "40px",
                  background: "var(--brand)",
                  borderRadius: "1px",
                }}
              />
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--brand)",
                }}
              >
                Trust &amp; Compliance
              </span>
            </div>
            <AnimatedHeading
              text={["Certifications &", "Compliance"]}
              as="h2"
              style={{
                fontSize: "clamp(3rem, 7vw, 5.5rem)",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "-0.04em",
                lineHeight: 0.9,
                color: "var(--text-1)",
              }}
            />
          </div>
        </FadeIn>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(420px, 100%), 1fr))",
            gap: "20px",
          }}
        >
          {CERTIFICATIONS.map((cert, i) => (
            <CertCard key={cert.id} cert={cert} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CertificationsBadges;
