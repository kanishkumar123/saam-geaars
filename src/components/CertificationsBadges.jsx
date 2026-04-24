// CertificationsBadges.jsx — shimmer only on hover, not always-on
import { useState } from "react";
import FadeIn from "./FadeIn";

const BADGES = [
  {
    id: 1,
    title: "ISO 9001:2015",
    subtitle: "Quality Management",
    icon: "QMS",
  },
  {
    id: 2,
    title: "BIS Certified",
    subtitle: "Bureau of Indian Standards",
    icon: "BIS",
  },
  { id: 3, title: "MSME Registered", subtitle: "Govt. of India", icon: "MSME" },
  { id: 4, title: "GST Compliant", subtitle: "33AOXPS6790L1ZS", icon: "GST" },
];

function BadgeCard({ badge }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "18px 24px",
        borderRadius: "14px",
        border: `1px solid ${hovered ? "var(--brand-border)" : "var(--border-1)"}`,
        background: "var(--bg-card)",
        minWidth: "210px",
        cursor: "default",
        transition: "border-color 0.25s, box-shadow 0.25s",
        boxShadow: hovered ? "var(--shadow)" : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Shimmer sweep — only visible on hover */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(105deg, transparent 35%, rgba(var(--brand-rgb),0.10) 50%, transparent 65%)",
          backgroundSize: "200% 100%",
          opacity: hovered ? 1 : 0,
          animation: hovered ? "shimmerBadge 0.7s ease forwards" : "none",
          transition: "opacity 0.2s",
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: "46px",
          height: "46px",
          borderRadius: "12px",
          background: "var(--brand-muted)",
          border: "1px solid var(--brand-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          fontWeight: 900,
          color: "var(--brand)",
          flexShrink: 0,
          letterSpacing: "0.04em",
          transition: "transform 0.25s",
          transform: hovered ? "scale(1.08)" : "scale(1)",
        }}
      >
        {badge.icon}
      </div>

      {/* Text */}
      <div>
        <p
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--text-1)",
            marginBottom: "2px",
          }}
        >
          {badge.title}
        </p>
        <p style={{ fontSize: "13px", color: "var(--text-3)" }}>
          {badge.subtitle}
        </p>
      </div>

      <style>{`@keyframes shimmerBadge { 0% { background-position: 200% center } 100% { background-position: -100% center } }`}</style>
    </div>
  );
}

export function CertificationsBadges() {
  return (
    <section
      style={{
        padding: "4rem 1.5rem",
        borderTop: "1px solid var(--border-1)",
        transition: "background 0.4s",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-3)",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            textAlign: "center",
            marginBottom: "2.5rem",
            fontWeight: 600,
          }}
        >
          Certifications &amp; Compliance
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "14px",
          }}
        >
          {BADGES.map((b, i) => (
            <FadeIn key={b.id} delay={i * 0.08}>
              <BadgeCard badge={b} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CertificationsBadges;
