// TestimonialsCarousel.jsx  (violet, CSS-var themed)
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TESTIMONIALS = [
  {
    id: 1,
    quote: "Saam Geaars delivered a complete 20:1 reduction gearbox within 10 days. The quality is exceptional — our conveyor has been running without a single issue for 3 years.",
    name: "R. Krishnamurthy", designation: "Plant Engineer", company: "Sri Lakshmi Cement Works", location: "Ariyalur, TN",
  },
  {
    id: 2,
    quote: "We've been sourcing precision helical gears from Saam for over 7 years. Their hardened and profile ground gears meet our tolerance specs every time. Highly recommended.",
    name: "Venkatesh Iyer", designation: "Purchase Manager", company: "Pricol Industries", location: "Coimbatore, TN",
  },
  {
    id: 3,
    quote: "Their engineering team helped us design a custom worm gearbox for our sugar cane crusher. The torque handling is excellent and the after-sales support is second to none.",
    name: "A. Selvakumar", designation: "Works Manager", company: "KPR Sugar Mills Ltd", location: "Erode, TN",
  },
];

const slide = {
  enter: (d) => ({ x: d > 0 ? "70%" : "-70%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d) => ({ x: d > 0 ? "-70%" : "70%", opacity: 0 }),
};

export default function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  const go = (next) => {
    const c = (next + TESTIMONIALS.length) % TESTIMONIALS.length;
    setDir(c > index ? 1 : -1);
    setIndex(c);
  };

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => go(index + 1), 5000);
    return () => clearInterval(timer.current);
  }, [index, paused]);

  const t = TESTIMONIALS[index];

  return (
    <section style={{ padding: "6rem 1.5rem", borderTop: "1px solid var(--border-1)", background: "var(--bg)" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <p style={{ fontSize: "13px", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.2em", textAlign: "center", marginBottom: "3rem" }}>
          What our clients say
        </p>

        <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} style={{ position: "relative", overflow: "hidden" }}>
          <AnimatePresence initial={false} custom={dir} mode="wait">
            <motion.div
              key={t.id} custom={dir} variants={slide}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.12}
              onDragEnd={(e, { offset }) => { if (offset.x < -60) go(index + 1); else if (offset.x > 60) go(index - 1); }}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-1)",
                borderRadius: "20px",
                padding: "3rem",
                cursor: "grab",
                userSelect: "none",
                boxShadow: "var(--shadow)",
              }}
            >
              <div style={{ fontSize: "64px", color: "var(--brand)", opacity: 0.2, fontFamily: "serif", lineHeight: 1, marginBottom: "1rem" }}>"</div>
              <p style={{ color: "var(--text-1)", fontSize: "18px", lineHeight: 1.8, fontWeight: 300, marginBottom: "2rem" }}>{t.quote}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--brand-muted)", border: "1.5px solid var(--brand-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)", fontWeight: 700, fontSize: "14px", flexShrink: 0 }}>
                  {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p style={{ color: "var(--text-1)", fontWeight: 700, fontSize: "16px", marginBottom: "2px" }}>{t.name}</p>
                  <p style={{ color: "var(--text-2)", fontSize: "14px" }}>{t.designation}, {t.company}</p>
                  <p style={{ color: "var(--text-3)", fontSize: "13px" }}>{t.location}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", marginTop: "24px" }}>
          <button onClick={() => go(index - 1)} aria-label="Previous"
            style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid var(--border-2)", background: "var(--bg-card)", cursor: "pointer", color: "var(--text-2)", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.2s, color 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.color = "var(--brand)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.color = "var(--text-2)"; }}
          >‹</button>

          <div style={{ display: "flex", gap: "8px" }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => go(i)} aria-label={`Testimonial ${i + 1}`}
                style={{ width: i === index ? "22px" : "8px", height: "8px", borderRadius: "4px", background: i === index ? "var(--brand)" : "var(--border-2)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s" }}
              />
            ))}
          </div>

          <button onClick={() => go(index + 1)} aria-label="Next"
            style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid var(--border-2)", background: "var(--bg-card)", cursor: "pointer", color: "var(--text-2)", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.2s, color 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.color = "var(--brand)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.color = "var(--text-2)"; }}
          >›</button>
        </div>
      </div>
    </section>
  );
}
