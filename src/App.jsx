// App.jsx — Saam Geaars v5
// All 10 requested changes applied:
// 1. Hero full-width + engaging lower block (3 capability cards + violet stat bar)
// 2. Marquee: gear/gearbox terms only
// 3. Gears visible through most sections; blur only on About, Contact
// 4. Certifications shimmer: hover-only (in CertificationsBadges.jsx)
// 5. WhySaam section removed
// 6. Process chips removed
// 7. Engineering Output left-aligned
// 8. Infrastructure left-aligned (in GalleryLightbox.jsx)
// 9. SimpleContactForm with real web3forms key
// 10. About reworked: quote-style, horizontal timeline, MD card
import { useRef, useMemo, useState } from "react";
import * as THREE from "three";
import { motion, useScroll, useSpring } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, Float } from "@react-three/drei";
import {
  Settings,
  Mail,
  Phone,
  MapPin,
  Target,
  CheckCircle2,
  Cpu,
  Crosshair,
  Flame,
  Activity,
  ArrowRight,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import logoImg from "./assets/saam-geaars.png";

import ActiveNav from "./components/ActiveNav";
import { ThemeProvider } from "./components/ThemeContext";
import { StructuredData } from "./components/StructuredDataAndMetaTags";
import {
  GrainOverlay,
  SectionDivider,
  GoogleMap,
} from "./components/GoogleMapGrainDivider";
import ScrollProgressBar from "./components/ScrollProgressBar";
import {
  CustomCursor,
  MagneticButton,
} from "./components/CustomCursorAndMagnetic";
import WhatsAppButton from "./components/WhatsAppButton";
import AnimatedHeading from "./components/AnimatedHeading";
import FadeIn from "./components/FadeIn";
import AnimatedCounter from "./components/AnimatedCounter";
import {
  IndustryMarquee,
  StatsBanner,
} from "./components/IndustryMarqueeAndStatsBanner";
import { CertificationsBadges } from "./components/CertificationsBadges";
import TestimonialsCarousel from "./components/TestimonialsCarousel";
import ProductFlipCards from "./components/ProductFlipCards";
import { GalleryLightbox } from "./components/GalleryLightbox";
import SimpleContactForm from "./components/SimpleContactForm";
import ProductShowcaseFullBleed from "./components/ProductShowcaseFullBleed";

// ── Reusable section shell ────────────────────────────────────────
// blurred=true: frosted glass so gears peek through softly
// blurred=false: fully transparent — gears fully visible
function SectionShell({ id, children, blurred = false, style = {} }) {
  return (
    <section
      id={id}
      style={{
        position: "relative",
        borderTop: "1px solid var(--border-1)",
        background: blurred
          ? "color-mix(in srgb, var(--bg-section) 80%, transparent)"
          : "transparent",
        backdropFilter: blurred ? "blur(16px) saturate(1.3)" : "none",
        WebkitBackdropFilter: blurred ? "blur(16px) saturate(1.3)" : "none",
        transition: "background 0.4s",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 3D GEAR MODEL
// ═══════════════════════════════════════════════════════════════════
const extrudeSettings = {
  depth: 0.6,
  bevelEnabled: true,
  bevelSegments: 3,
  steps: 1,
  bevelSize: 0.05,
  bevelThickness: 0.05,
};

function createGearShape(teeth, outerR, innerR, holeR) {
  const shape = new THREE.Shape();
  const n = teeth * 4;
  const step = (Math.PI * 2) / n;
  for (let i = 0; i < n; i++) {
    const r = i % 4 === 1 || i % 4 === 2 ? outerR : innerR;
    if (i === 0) shape.moveTo(Math.cos(i * step) * r, Math.sin(i * step) * r);
    else shape.lineTo(Math.cos(i * step) * r, Math.sin(i * step) * r);
  }
  const hole = new THREE.Path();
  hole.absarc(0, 0, holeR, 0, Math.PI * 2, false);
  shape.holes.push(hole);
  return shape;
}

function ProceduralGear({ teeth, radius, color = "#8c9196", ...props }) {
  const shape = useMemo(
    () => createGearShape(teeth, radius, radius - 0.4, radius * 0.3),
    [teeth, radius],
  );
  return (
    <mesh {...props} castShadow receiveShadow>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.25} />
    </mesh>
  );
}

function GearboxModel({ scrollProgress }) {
  const largeRef = useRef();
  const smallRef = useRef();
  useFrame(() => {
    if (largeRef.current && smallRef.current) {
      const r = scrollProgress.get() * Math.PI * 2;
      largeRef.current.rotation.z = r;
      smallRef.current.rotation.z = -(r * 2) + 0.314;
    }
  });
  return (
    <group rotation={[Math.PI / 4, Math.PI / 6, 0]}>
      <group ref={largeRef}>
        <ProceduralGear teeth={20} radius={3} position={[0, 0, -0.3]} />
      </group>
      <group ref={smallRef} position={[4.1, 0, 0]}>
        <ProceduralGear
          teeth={10}
          radius={1.5}
          position={[0, 0, -0.3]}
          color="#403587"
        />
      </group>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HERO — full-width, arrow bullet, engaging lower block
// ═══════════════════════════════════════════════════════════════════
function HeroSection() {
  const capabilities = [
    { icon: Zap, label: "CNC", sub: "Complex gear geometries" },
    { icon: Shield, label: "±0.001 mm", sub: "Profile ground tolerance" },
    { icon: Clock, label: "7–10 Days", sub: "Custom turnaround time" },
  ];

  return (
    // Transparent — gears fully visible behind hero
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "300px 1.5rem 4rem",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
        {/* Eyebrow */}
        <FadeIn delay={0}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                height: "2px",
                width: "52px",
                background: "var(--brand)",
                borderRadius: "1px",
              }}
            />
            <span
              style={{
                color: "var(--brand)",
                fontFamily: "monospace",
                fontSize: "14px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Est. 2001 · Coimbatore, India
            </span>
          </div>
        </FadeIn>

        {/* H1 — truly large, full viewport feel */}
        <AnimatedHeading
          text={["Insightful", "Engineering."]}
          highlight="Engineering."
          as="h1"
          style={{
            fontSize: "clamp(4.5rem, 12vw, 9.5rem)",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "-0.05em",
            lineHeight: 0.86,
            marginBottom: "2.5rem",
            color: "var(--text-1)",
          }}
          stagger={0.09}
        />

        {/* Subtext with violet arrow bullet */}
        <FadeIn delay={0.45}>
          <div
            style={{
              display: "flex",
              alignItems: "stretch", // Changed to stretch so the line spans the text
              gap: "16px",
              marginBottom: "2.5rem",
              maxWidth: "640px",
            }}
          >
            <div
              style={{
                width: "4px",
                background:
                  "linear-gradient(to bottom, var(--brand), transparent)",
                borderRadius: "4px",
                flexShrink: 0,
                marginTop: "12px",
                marginBottom: "12px", // Keeps it slightly shorter than the text block
              }}
            />
            <p
              style={{
                fontSize: "clamp(17px, 2vw, 21px)",
                color: "var(--text-2)",
                fontWeight: 300,
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              Over two decades manufacturing precision gears, gearboxes, and
              sprockets from the industrial heart of South India — machined to
              IS, ISO, AGMA, and DIN standards.
            </p>
          </div>
        </FadeIn>

        {/* CTA buttons */}
        <FadeIn delay={0.6}>
          <div
            style={{
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
              marginBottom: "5rem",
            }}
          >
            <MagneticButton>
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "var(--brand)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "15px 34px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  boxShadow: "0 6px 24px rgba(64,53,135,0.35)",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--brand-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--brand)";
                }}
              >
                Request a Quote
              </motion.a>
            </MagneticButton>
            <MagneticButton>
              <motion.a
                href="#products"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  border: "1.5px solid var(--border-2)",
                  color: "var(--text-2)",
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "15px 34px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  background: "var(--bg-card)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--brand-border)";
                  e.currentTarget.style.color = "var(--brand)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-2)";
                  e.currentTarget.style.color = "var(--text-2)";
                }}
              >
                View Products
              </motion.a>
            </MagneticButton>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function MissionCard({ item }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="mission-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: "16px",
        padding: "1.25rem",
        cursor: "default",
        isolation: "isolate",
        overflow: "hidden",
        // Border: glowing conic ring on hover, subtle default
        border: `1px solid ${hovered ? "transparent" : "var(--border-1)"}`,
        background: "var(--bg-elevated)",
        // Conic gradient glow border via box-shadow on hover
        boxShadow: hovered
          ? `0 0 0 1.5px ${item.accentColor}, 0 8px 28px -4px ${item.accentColor.replace("0.75", "0.25")}`
          : "none",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition:
          "border-color 0.25s, box-shadow 0.35s, transform 0.3s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Shimmer sweep — fires on hover */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          borderRadius: "16px",
          background:
            "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)",
          backgroundSize: "200% 100%",
          backgroundPosition: hovered ? "-100% center" : "200% center",
          animation: hovered ? "missionShimmer 0.65s ease forwards" : "none",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s",
        }}
      />

      {/* Top row: number + icon ring */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--text-3)",
            letterSpacing: "0.12em",
          }}
        >
          {item.n}
        </span>

        <div
          className="mission-icon-ring"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "1px solid var(--border-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: hovered
              ? item.accentColor.replace("0.75", "0.12")
              : "transparent",
            transition: "background 0.25s",
          }}
        >
          <CheckCircle2
            style={{
              width: "15px",
              height: "15px",
              color: hovered ? item.barColor : "var(--text-3)",
              transition: "color 0.25s",
            }}
          />
        </div>
      </div>

      {/* Label */}
      <p
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: "var(--text-1)",
          lineHeight: 1.4,
          marginBottom: "6px",
        }}
      >
        {item.label}
      </p>

      {/* Description */}
      <p
        style={{
          fontSize: "15px",
          color: "var(--text-2)",
          lineHeight: 1.6,
          marginBottom: "1rem",
        }}
      >
        {item.sub}
      </p>

      {/* Fill bar */}
      <div
        style={{
          height: "2px",
          borderRadius: "1px",
          background: "var(--border-1)",
          overflow: "hidden",
        }}
      >
        <div
          className="mission-bar-fill"
          style={{
            height: "100%",
            background: item.barColor,
            borderRadius: "1px",
          }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ABOUT — reworked: quote-style + horizontal milestone strip (item 10)
// Uses blurred SectionShell so gears show softly behind
// ═══════════════════════════════════════════════════════════════════
function AboutSection() {
  const missionItems = [
    "Superior Customer Service",
    "Environmental Quality Protection",
    "Equal Access to Resources",
    "Encourage Innovation",
    "Sustainable Development",
    "Zero Waste Disposal",
  ];

  return (
    <SectionShell
      id="about"
      blurred
      style={{ padding: "5rem 1.5rem 2rem 1.5rem" }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Section label */}
        <FadeIn>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "3rem",
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
              Company Profile
            </span>
          </div>
        </FadeIn>

        {/* Two columns: story + right panel */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "1rem",
            marginBottom: "4rem",
          }}
          className="lg:grid-cols-[1.1fr_1fr]"
        >
          {/* LEFT — large heading + bordered quote paragraph */}
          <FadeIn>
            <div>
              {/* Large decorative quote mark */}
              <div
                style={{
                  fontSize: "6rem",
                  lineHeight: 0.2,
                  color: "var(--brand)",
                  opacity: 0.12,
                  fontFamily: "Georgia, serif",
                  marginBottom: "0rem",
                  userSelect: "none",
                }}
              >
                "
              </div>

              <AnimatedHeading
                text={["Our Story & ", "Heritage"]}
                as="h2"
                style={{
                  fontSize: "clamp(3rem, 6vw, 5rem)",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "-0.04em",
                  lineHeight: 0.9,
                  marginBottom: "2rem",
                  color: "var(--text-1)",
                }}
              />

              {/* Bordered pull-quote */}
              <div
                style={{
                  borderLeft: "3px solid var(--brand)",
                  paddingLeft: "24px",
                  marginBottom: "1.75rem",
                }}
              >
                <p
                  style={{
                    color: "var(--text-2)",
                    lineHeight: 1.9,
                    fontSize: "18px",
                  }}
                >
                  Founded in 2001 by{" "}
                  <strong style={{ color: "var(--text-1)", fontWeight: 700 }}>
                    Mr. T. Selvaraj
                  </strong>{" "}
                  in Coimbatore — South India's premier industrial hub — Saam
                  Geaars has grown from a precision machining workshop into a
                  comprehensive gear and gearbox manufacturer trusted by
                  industry leaders across the country.
                </p>
              </div>
            </div>
          </FadeIn>

          {/* RIGHT — MD card + mission 2-col grid */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* MD card */}
            <FadeIn delay={0.1}>
              <div
                style={{
                  background: "var(--brand)",
                  borderRadius: "20px",
                  padding: "2.5rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Gear watermark */}
                <div
                  style={{
                    position: "absolute",
                    right: "-24px",
                    bottom: "-28px",
                    fontSize: "9rem",
                    color: "rgba(255,255,255,0.07)",
                    userSelect: "none",
                    pointerEvents: "none",
                    lineHeight: 1,
                  }}
                >
                  ⚙
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      border: "2px solid rgba(255,255,255,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      fontWeight: 900,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    TS
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "19px",
                        fontWeight: 800,
                        color: "#fff",
                      }}
                    >
                      Mr. T. Selvaraj
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.7)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginTop: "3px",
                      }}
                    >
                      Proprietor
                    </div>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "17px",
                    color: "rgba(255,255,255,0.88)",
                    lineHeight: 1.75,
                    fontStyle: "italic",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  "Engineering is not just our work — it is our way of thinking.
                  Every gear we make carries the trust of the industry that runs
                  on it."
                </p>
              </div>
            </FadeIn>

            {/* Mission — compact 2-col grid */}
            <FadeIn delay={0.2}>
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-1)",
                  padding: "2rem 2rem 1.75rem",
                  borderRadius: "20px",
                  boxShadow: "var(--shadow)",
                }}
              >
                {/* Title */}
                <h3
                  style={{
                    fontSize: "30px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    color: "var(--text-1)",
                  }}
                >
                  <Target
                    style={{
                      color: "var(--brand)",
                      width: "26px",
                      height: "26px",
                    }}
                  />
                  Our Mission
                </h3>

                {/* 3-column card grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "10px",
                  }}
                >
                  {[
                    {
                      n: "01",
                      accentColor: "rgba(64,53,135,0.75)",
                      barColor: "var(--brand)",
                      label: "Superior Customer Service",
                      sub: "Every client gets direct access to our engineering team — from enquiry to dispatch.",
                    },
                    {
                      n: "02",
                      accentColor: "rgba(34,197,94,0.75)",
                      barColor: "#22c55e",
                      label: "Protect the Environment",
                      sub: "Sustainable machining practices and responsible material sourcing across all operations.",
                    },
                    {
                      n: "03",
                      accentColor: "rgba(226,75,74,0.75)",
                      barColor: "#e24b4a",
                      label: "Equal Access to Resources",
                      sub: "Fair allocation of capacity — no client too small or too large for our attention.",
                    },
                    {
                      n: "04",
                      accentColor: "rgba(64,53,135,0.75)",
                      barColor: "var(--brand)",
                      label: "Encourage Innovation",
                      sub: "Continuously investing in new tooling, processes, and engineering capabilities.",
                    },
                    {
                      n: "05",
                      accentColor: "rgba(34,197,94,0.75)",
                      barColor: "#22c55e",
                      label: "Sustainable Development",
                      sub: "Long-term growth built on quality and trust rather than short-term volume.",
                    },
                    {
                      n: "06",
                      accentColor: "rgba(226,75,74,0.75)",
                      barColor: "#e24b4a",
                      label: "Zero Waste Disposal",
                      sub: "All metal scrap and process waste is segregated, recycled, or safely disposed.",
                    },
                  ].map((item) => (
                    <MissionCard key={item.n} item={item} />
                  ))}
                </div>

                {/* Keyframes injected once */}
                <style>{`
      @keyframes missionShimmer {
        0%   { background-position: 200% center }
        100% { background-position: -100% center }
      }
      @keyframes missionSpin {
        to { transform: rotate(360deg); }
      }
      .mission-bar-fill {
        width: 0%;
        transition: width 0.55s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .mission-card:hover .mission-bar-fill {
        width: 100%;
      }
      .mission-icon-ring {
        transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.25s;
      }
      .mission-card:hover .mission-icon-ring {
        transform: rotate(14deg) scale(1.12);
        border-color: var(--brand-border) !important;
      }
    `}</style>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MANUFACTURING JOURNEY — no detail chips (item 6)
// Transparent — gears visible behind
// ═══════════════════════════════════════════════════════════════════
function ManufacturingJourney() {
  const steps = [
    {
      id: "01",
      title: "Engineering",
      desc: "Every gear begins as a blueprint. Our engineering team analyses application loads, speed requirements, and material specifications. CAD and CAM models are verified before a single tool touches metal.",
      icon: Cpu,
    },
    {
      id: "02",
      title: "CNC Machining",
      desc: "Our CNC machining centres produce complex gear geometries with repeatability that conventional machines cannot match. The production floor runs double-shift to meet tight deadlines.",
      icon: Crosshair,
    },
    {
      id: "03",
      title: "Heat Treatment",
      desc: "Carburizing, case hardening, and induction hardening are performed in-house — not outsourced. This gives us full metallurgical traceability and consistent case depths critical for high-torque applications.",
      icon: Flame,
    },
    {
      id: "04",
      title: "Quality Assurance",
      desc: "Before dispatch, every gear is inspected, subjected to ultrasonic and magnetic particle tests, and profile-checked against the original drawing. Zero-defect shipping is the standard.",
      icon: Activity,
    },
  ];

  return (
    // Transparent section — gears visible (item 3)
    <section
      id="process"
      style={{ padding: "8rem 1.5rem", position: "relative", zIndex: 5 }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <div
              style={{
                display: "inline-flex",
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
                How We Build
              </span>
              <div
                style={{
                  height: "2px",
                  width: "40px",
                  background: "var(--brand)",
                  borderRadius: "1px",
                }}
              />
            </div>
            <AnimatedHeading
              text={["The Saam", "Process"]}
              highlight="Process"
              as="h2"
              style={{
                fontSize: "clamp(3.5rem, 9vw, 7rem)",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "-0.04em",
                lineHeight: 0.88,
                marginBottom: "1.5rem",
                color: "var(--text-1)",
              }}
            />
            <p
              style={{
                color: "var(--text-2)",
                fontSize: "18px",
                maxWidth: "560px",
                margin: "0 auto",
                lineHeight: 1.75,
              }}
            >
              Four phases of manufacturing precision — from engineering design
              to zero-defect dispatch.
            </p>
          </div>
        </FadeIn>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "5rem",
            paddingBottom: "6rem",
          }}
        >
          {steps.map((step, index) => (
            <div
              key={index}
              style={{
                position: "sticky",
                top: `calc(12vh + ${index * 2.5}rem)`,
                // Frosted glass cards — gears show through softly behind cards (item 3)
                background:
                  "color-mix(in srgb, var(--bg-card) 88%, transparent)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid var(--border-1)",
                padding: "3rem 3.5rem",
                borderRadius: "20px",
                boxShadow: "var(--shadow-lg)",
                transition: "border-color 0.4s",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--brand-border)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-1)";
              }}
            >
              {/* Watermark number */}
              <div
                style={{
                  position: "absolute",
                  right: "1.5rem",
                  bottom: "-2rem",
                  fontSize: "11rem",
                  fontWeight: 900,
                  color: "var(--brand-muted)",
                  pointerEvents: "none",
                  userSelect: "none",
                  lineHeight: 1,
                }}
              >
                {step.id}
              </div>

              <div
                style={{
                  position: "relative",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "2rem",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "16px",
                    background: "var(--brand-muted)",
                    border: "1px solid var(--brand-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <step.icon
                    style={{
                      width: "28px",
                      height: "28px",
                      color: "var(--brand)",
                    }}
                    strokeWidth={1.5}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-3)",
                      fontFamily: "monospace",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    Phase {step.id}
                  </div>
                  <AnimatedHeading
                    text={step.title}
                    as="h3"
                    style={{
                      fontSize: "clamp(2.2rem, 4.5vw, 3.2rem)",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "-0.03em",
                      lineHeight: 0.95,
                      marginBottom: "1.25rem",
                      color: "var(--text-1)",
                    }}
                  />
                  <p
                    style={{
                      color: "var(--text-2)",
                      fontSize: "17px",
                      lineHeight: 1.85,
                      maxWidth: "640px",
                    }}
                  >
                    {step.desc}
                  </p>
                  {/* NO chips (item 6) */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PRODUCTS — LEFT-aligned heading (item 7), transparent so gears show
// ═══════════════════════════════════════════════════════════════════
function ProductsSection() {
  return (
    <section
      id="products"
      style={{ padding: "8rem 1.5rem", borderTop: "1px solid var(--border-1)" }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <FadeIn>
          {/* LEFT-ALIGNED (item 7) */}
          <div style={{ marginBottom: "4rem" }}>
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
                Our Range
              </span>
            </div>
            <AnimatedHeading
              text={["Engineering ", "Output"]}
              as="h2"
              style={{
                fontSize: "clamp(3.2rem, 8vw, 6.5rem)",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "-0.05em",
                lineHeight: 0.88,
                marginBottom: "1rem",
                color: "var(--text-1)",
              }}
            />
            <p
              style={{
                color: "var(--text-2)",
                fontSize: "18px",
                maxWidth: "560px",
                lineHeight: 1.75,
              }}
            >
              Precision gears, gearboxes, and sprockets manufactured to IS, ISO,
              AGMA, and DIN standards. Hover a card to reveal full
              specifications.
            </p>
          </div>
        </FadeIn>

        <ProductFlipCards />

        <FadeIn delay={0.2}>
          <div
            style={{
              marginTop: "3rem",
              padding: "2rem 2.5rem",
              background: "var(--bg-card)",
              border: "1px solid var(--border-1)",
              borderRadius: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              boxShadow: "var(--shadow)",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "19px",
                  fontWeight: 700,
                  color: "var(--text-1)",
                  marginBottom: "4px",
                }}
              >
                Need a custom specification?
              </p>
              <p style={{ fontSize: "15px", color: "var(--text-2)" }}>
                We manufacture to your drawing — single piece or batch
                production.
              </p>
            </div>
            <a
              href="#contact"
              style={{
                padding: "13px 28px",
                background: "var(--brand)",
                color: "#fff",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                textDecoration: "none",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--brand-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--brand)";
              }}
            >
              Enquire Now
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CONTACT — simple form (item 9), blurred section
// ═══════════════════════════════════════════════════════════════════
function ContactSection() {
  const contactItems = [
    {
      icon: MapPin,
      label: "Factory",
      lines: [
        "16/1, Thiyagi Sengaliyappan Nagar",
        "Irugur, Coimbatore — 641 103, TN",
      ],
    },
    {
      icon: Phone,
      label: "Direct Lines",
      lines: ["+91 98430 18244", "+91 94887 59678"],
    },
    {
      icon: Mail,
      label: "Electronic Mail",
      lines: ["saamgeaars@gmail.com", "saamgeaars@rediffmail.com"],
    },
  ];

  return (
    <SectionShell
      id="contact"
      blurred
      style={{
        padding: "8rem 1.5rem 5rem",
        borderTop: "1px solid var(--border-2)",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
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
                Get in Touch
              </span>
              <div
                style={{
                  height: "2px",
                  width: "40px",
                  background: "var(--brand)",
                  borderRadius: "1px",
                }}
              />
            </div>
            <AnimatedHeading
              text={["Initiate", " Contact"]}
              as="h2"
              style={{
                fontSize: "clamp(3.2rem, 8vw, 6.5rem)",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "-0.04em",
                lineHeight: 0.88,
                marginBottom: "1.5rem",
                color: "var(--text-1)",
              }}
            />
            <p
              style={{
                fontSize: "18px",
                color: "var(--text-2)",
                maxWidth: "500px",
                margin: "0 auto",
                lineHeight: 1.75,
              }}
            >
              Ready to optimise your mechanical output? Share your requirements
              and we'll deliver a precise solution.
            </p>
          </div>
        </FadeIn>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4rem" }}
          className="lg:grid-cols-2"
        >
          <FadeIn>
            <div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  marginBottom: "2rem",
                }}
              >
                {contactItems.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "16px",
                      padding: "20px",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-1)",
                      borderRadius: "14px",
                      boxShadow: "var(--shadow)",
                    }}
                  >
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
                        flexShrink: 0,
                      }}
                    >
                      <item.icon
                        style={{
                          color: "var(--brand)",
                          width: "20px",
                          height: "20px",
                        }}
                      />
                    </div>
                    <div>
                      <h4
                        style={{
                          fontSize: "12px",
                          color: "var(--text-3)",
                          textTransform: "uppercase",
                          letterSpacing: "0.14em",
                          marginBottom: "6px",
                        }}
                      >
                        {item.label}
                      </h4>
                      {item.lines.map((line, j) => (
                        <p
                          key={j}
                          style={{
                            color: "var(--text-1)",
                            fontSize: "16px",
                            lineHeight: 1.65,
                          }}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <GoogleMap />
            </div>
          </FadeIn>

          {/* Simple contact form — name, phone, email, message (item 9) */}
          <FadeIn delay={0.15}>
            <SimpleContactForm />
          </FadeIn>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "5rem",
            paddingTop: "2.5rem",
            borderTop: "1px solid var(--border-1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
          className="md:flex-row md:justify-between"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "var(--white)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={logoImg}
                alt="SaamGeaars"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text-1)",
              }}
            >
              Saam<span style={{ color: "var(--brand)" }}>Geaars</span>
            </span>
          </div>
          <div style={{ textAlign: "center" }} className="md:text-right">
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-3)",
                marginBottom: "2px",
              }}
            >
              Precision Engineering since 2001
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-3)" }}>
              © 2026 Saam Geaars. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════
function InnerApp() {
  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  });

  return (
    <div
      style={{
        position: "relative",
        background: "var(--bg)",
        color: "var(--text-1)",
        minHeight: "100vh",
        transition: "background 0.4s, color 0.4s",
      }}
    >
      <StructuredData />
      <GrainOverlay opacity={0.022} />
      <ScrollProgressBar scrollYProgress={scrollYProgress} />
      {/* <CustomCursor /> */}

      {/* Fixed 3D gear background — intentionally visible through most sections (item 3) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
          <ambientLight intensity={1.5} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            intensity={3}
            castShadow
          />
          <pointLight position={[-10, -10, -10]} intensity={0.8} />
          <Environment preset="city" />
          <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
            <group position={[3, 0, -2]}>
              <GearboxModel scrollProgress={smoothScroll} />
            </group>
          </Float>
          <ContactShadows
            position={[0, -5, 0]}
            opacity={0.2}
            scale={15}
            blur={2}
            far={6}
          />
        </Canvas>
        {/* Only left-edge gradient — right side stays open so gears show */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, var(--canvas-grad-from) 20%, var(--canvas-grad-mid) 50%, transparent 80%)",
            zIndex: 10,
            transition: "background 0.4s",
          }}
        />
      </div>

      <ActiveNav />
      <WhatsAppButton />

      <div style={{ position: "relative", zIndex: 10 }}>
        <HeroSection />
        <IndustryMarquee />
        {/* About: blurred — gears softly visible */}
        <AboutSection />
        <StatsBanner />
        <SectionDivider />
        <ProductShowcaseFullBleed />
        <CertificationsBadges />
        <SectionDivider />
        <TestimonialsCarousel />
        {/* WhySaamSection REMOVED (item 5) */}
        <SectionDivider label="Our Process" />
        {/* Process: transparent — gears fully visible behind frosted cards */}
        <ManufacturingJourney />
        {/* Products: transparent — gears visible */}
        <ProductsSection />
        {/* Gallery: blurred — gears softly visible */}
        <GalleryLightbox />
        {/* Contact: blurred — gears softly visible */}
        <ContactSection />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <InnerApp />
    </ThemeProvider>
  );
}
