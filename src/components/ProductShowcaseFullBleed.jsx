// ═══════════════════════════════════════════════════════════════
// ProductShowcaseFullBleed.jsx
//
// Premium contained product carousel.
// - Max 1200px main carousel
// - Previous/next cards visible outside the 1200px area
// - Smooth spring slide animation
// - Working auto-slide
// - Drag/swipe support
// - No category pills, no specs, no enquire button
// - No violet gradient/tint
// - Centered dots only
//
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ── PRODUCT IMAGE IMPORTS ───────────────────────────────────────
import product1 from "../assets/product1.png";
import product2 from "../assets/product2.png";
import product3 from "../assets/product3.png";
import product4 from "../assets/product4.png";
import product5 from "../assets/product5.png";
import product6 from "../assets/product6.png";
import product7 from "../assets/product7.png";

// ── PRODUCT DATA ────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: "p1",
    image: product1,
    name: "6 Row Special Purpose Sprockets",
    tagline:
      "Heavy-duty multi-row sprockets engineered for precision, strength, and reliable industrial power transmission.",
  },
  {
    id: "p2",
    image: product2,
    name: "3.5 Meters Girth Gear",
    tagline:
      "Large-diameter girth gear designed for smooth rotation, stable load handling, and long-lasting performance.",
  },
  {
    id: "p3",
    image: product3,
    name: "8T Sprockets",
    tagline:
      "Compact 8-tooth sprockets built for accurate chain engagement and dependable motion transfer.",
  },
  {
    id: "p4",
    image: product4,
    name: "10T 4 Row Special Sprocket",
    tagline:
      "Four-row 10T sprocket crafted for synchronized drive performance in demanding machinery applications.",
  },
  {
    id: "p5",
    image: product5,
    name: "40T 6 Row Special Sprocket",
    tagline:
      "Robust 40-tooth six-row sprocket made for high-load operation, durability, and consistent chain grip.",
  },
  {
    id: "p6",
    image: product6,
    name: "Gear Wheel",
    tagline:
      "Precision-machined gear wheel built for smooth torque transfer, strength, and long service life.",
  },
  {
    id: "p7",
    image: product7,
    name: "6 Row Special 10T Sprocket",
    tagline:
      "Specialized 10T six-row sprocket designed for rugged chain drive systems and heavy-duty usage.",
  },
];

const AUTO_INTERVAL = 5200;

const slideSpring = {
  type: "spring",
  stiffness: 120,
  damping: 26,
  mass: 0.9,
};

const textContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
};

const textItemVariants = {
  hidden: {
    opacity: 0,
    y: 26,
    filter: "blur(5px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.58,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(3px)",
    transition: {
      duration: 0.22,
      ease: "easeIn",
    },
  },
};

// ── Placeholder image tile ──────────────────────────────────────
function ImagePlaceholder({ name }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(135deg, #111111 0%, #252525 50%, #070707 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "30px",
          background: "rgba(255,255,255,0.08)",
          border: "1.5px solid rgba(255,255,255,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "48px",
          fontWeight: 900,
          color: "rgba(255,255,255,0.45)",
          letterSpacing: "0.05em",
        }}
      >
        {initials}
      </div>

      <p
        style={{
          fontSize: "13px",
          color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        Image placeholder
      </p>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────
function getCircularPosition(i, activeIndex, total) {
  let diff = i - activeIndex;

  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;

  return diff;
}

function getCardAnimation(position) {
  const abs = Math.abs(position);

  if (abs === 0) {
    return {
      x: "0%",
      scale: 1,
      opacity: 1,
      rotateY: 0,
      filter: "blur(0px)",
    };
  }

  if (abs === 1) {
    return {
      x: position > 0 ? "74%" : "-74%",
      scale: 0.78,
      opacity: 0.42,
      rotateY: position > 0 ? -4 : 4,
      filter: "blur(0.4px)",
    };
  }

  return {
    x: position > 0 ? "118%" : "-118%",
    scale: 0.68,
    opacity: 0,
    rotateY: position > 0 ? -8 : 8,
    filter: "blur(2px)",
  };
}

// ── Main component ───────────────────────────────────────────────
export default function ProductShowcaseFullBleed() {
  const [index, setIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimeoutRef = useRef(null);

  const total = PRODUCTS.length;

  const goTo = useCallback(
    (i) => {
      setIndex((i + total) % total);
    },
    [total],
  );

  const next = useCallback(() => {
    setIndex((current) => (current + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setIndex((current) => (current - 1 + total) % total);
  }, [total]);

  const pauseBriefly = useCallback(() => {
    setIsInteracting(true);

    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }

    interactionTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 1800);
  }, []);

  // ── Working auto-slide ────────────────────────────────────────
  useEffect(() => {
    if (isInteracting) return;

    const timer = setTimeout(() => {
      next();
    }, AUTO_INTERVAL);

    return () => clearTimeout(timer);
  }, [index, isInteracting, next]);

  // ── Cleanup ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  // ── Keyboard navigation ───────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        pauseBriefly();
        next();
      }

      if (e.key === "ArrowLeft") {
        pauseBriefly();
        prev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev, pauseBriefly]);

  return (
    <section
      id="products"
      style={{
        position: "relative",
        width: "100%",
        padding: "4rem 0",
        overflow: "hidden",
        background:
          "radial-gradient(circle at center, rgba(255,255,255,0.06) 0%, transparent 34%)",
      }}
      aria-roledescription="product carousel"
    >
      <div
        style={{
          position: "relative",
          width: "min(1200px, calc(100vw - 48px))",
          height: "clamp(500px, 70vh, 720px)",
          margin: "0 auto",
          overflow: "visible",
          perspective: "1400px",
        }}
      >
        {/* ── Carousel cards ───────────────────────────────────── */}
        {PRODUCTS.map((p, i) => {
          const position = getCircularPosition(i, index, total);
          const absPosition = Math.abs(position);

          const isActive = position === 0;
          const isSideCard = absPosition === 1;
          const isHidden = absPosition > 1;

          return (
            <motion.article
              key={p.id}
              animate={getCardAnimation(position)}
              transition={slideSpring}
              drag={isActive ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.14}
              onDragStart={() => {
                setIsInteracting(true);
              }}
              onDragEnd={(_, info) => {
                const swipeDistance = info.offset.x;
                const swipeVelocity = info.velocity.x;

                if (swipeDistance < -85 || swipeVelocity < -550) {
                  next();
                } else if (swipeDistance > 85 || swipeVelocity > 550) {
                  prev();
                }

                pauseBriefly();
              }}
              onClick={() => {
                if (isSideCard) {
                  pauseBriefly();
                  goTo(i);
                }
              }}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: isActive ? 30 : isSideCard ? 15 : 1,
                borderRadius: isActive ? "28px" : "24px",
                overflow: "hidden",
                background: "#090909",
                border: isActive
                  ? "1px solid rgba(255,255,255,0.15)"
                  : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isActive
                  ? "0 30px 100px rgba(0,0,0,0.36)"
                  : "0 18px 60px rgba(0,0,0,0.22)",
                cursor: isActive ? "grab" : isSideCard ? "pointer" : "default",
                pointerEvents: isHidden ? "none" : "auto",
                transformStyle: "preserve-3d",
                willChange: "transform, opacity, filter",
              }}
              whileTap={isActive ? { cursor: "grabbing" } : undefined}
            >
              {p.image ? (
                <motion.img
                  src={p.image}
                  alt={p.name}
                  animate={{
                    scale: isActive ? 1.025 : 1.06,
                  }}
                  transition={{
                    duration: 1.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    display: "block",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                  draggable={false}
                />
              ) : (
                <ImagePlaceholder name={p.name} />
              )}

              {/* Neutral overlays only. No violet shade. */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, transparent 34%)",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.58) 26%, rgba(0,0,0,0.16) 54%, transparent 76%)",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />

              {!isActive && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.34)",
                    zIndex: 3,
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* Active product text */}
              {isActive && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`text-${p.id}`}
                    variants={textContainerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    style={{
                      position: "absolute",
                      left: "clamp(1.4rem, 3vw, 3rem)",
                      bottom: "clamp(3.4rem, 7vh, 5.2rem)",
                      zIndex: 10,
                      maxWidth: "min(780px, 72vw)",
                      pointerEvents: "none",
                    }}
                  >
                    <div style={{ overflow: "hidden" }}>
                      {p.name.split(" ").map((word, wi) => (
                        <motion.span
                          key={wi}
                          variants={textItemVariants}
                          style={{
                            display: "inline-block",
                            fontSize: "clamp(1.6rem, 3vw, 3.4rem)",
                            fontWeight: 950,
                            color: "#fff",
                            letterSpacing: "-0.055em",
                            lineHeight: 0.9,
                            marginRight: "0.23em",
                            textTransform: "uppercase",
                            textShadow: "0 8px 34px rgba(0,0,0,0.45)",
                          }}
                        >
                          {word}
                        </motion.span>
                      ))}
                    </div>

                    <motion.p
                      variants={textItemVariants}
                      style={{
                        marginTop: "1.35rem",
                        marginBottom: 0,
                        fontSize: "clamp(15px, 1.4vw, 18px)",
                        color: "rgba(255,255,255,0.76)",
                        fontWeight: 300,
                        lineHeight: 1.65,
                        maxWidth: "560px",
                        textShadow: "0 4px 20px rgba(0,0,0,0.45)",
                      }}
                    >
                      {p.tagline}
                    </motion.p>
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.article>
          );
        })}

        {/* ── Top heading ─────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            top: "clamp(1.4rem, 3vw, 2.4rem)",
            left: "clamp(1.4rem, 3vw, 3rem)",
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            gap: "14px",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              height: "2px",
              width: "38px",
              background: "#ffffff",
              borderRadius: "999px",
              boxShadow: "0 0 18px rgba(255,255,255,0.28)",
            }}
          />

          <span
            style={{
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Our Range
          </span>
        </div>

        {/* ── Counter ─────────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            top: "clamp(1.4rem, 3vw, 2.4rem)",
            right: "clamp(1.4rem, 3vw, 3rem)",
            zIndex: 60,
            display: "flex",
            alignItems: "baseline",
            gap: "5px",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: "24px",
              fontWeight: 950,
              color: "#fff",
              lineHeight: 1,
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          <span
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.38)",
              fontFamily: "monospace",
            }}
          >
            /{String(total).padStart(2, "0")}
          </span>
        </div>

        {/* ── Arrows ──────────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            right: "clamp(1.4rem, 3vw, 3rem)",
            bottom: "clamp(1.5rem, 3vw, 2.6rem)",
            zIndex: 70,
            display: "flex",
            gap: "10px",
          }}
        >
          <motion.button
            type="button"
            onClick={() => {
              pauseBriefly();
              prev();
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            aria-label="Previous product"
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.22)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
            }}
          >
            <ChevronLeft style={{ width: "22px", height: "22px" }} />
          </motion.button>

          <motion.button
            type="button"
            onClick={() => {
              pauseBriefly();
              next();
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            aria-label="Next product"
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "#ffffff",
              border: "1px solid rgba(255,255,255,0.8)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#080808",
              boxShadow: "0 10px 32px rgba(0,0,0,0.28)",
            }}
          >
            <ChevronRight style={{ width: "22px", height: "22px" }} />
          </motion.button>
        </div>

        {/* ── Centered dots only ──────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "1.45rem",
            transform: "translateX(-50%)",
            zIndex: 65,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {PRODUCTS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                pauseBriefly();
                goTo(i);
              }}
              aria-label={`Go to ${p.name}`}
              style={{
                width: i === index ? "24px" : "8px",
                height: "8px",
                borderRadius: "999px",
                background: i === index ? "#ffffff" : "rgba(255,255,255,0.35)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition:
                  "width 0.35s cubic-bezier(0.22,1,0.36,1), background 0.25s, opacity 0.25s",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
