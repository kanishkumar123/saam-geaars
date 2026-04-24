// GalleryLightbox.jsx
// Lightbox opens from screen center (scale+fade), not from card position.
// Removed layoutId — that was causing the slide-from-scroll-position bug.
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import FadeIn from "./FadeIn";
import AnimatedHeading from "./AnimatedHeading";

const IMAGES = [
  {
    id: "img1",
    span: "md:col-span-2 md:row-span-2",
    title: "Primary Machining Center",
    caption: "5-axis CNC milling in our 9500 Sq Ft main bay",
    url: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "img2",
    span: "",
    title: "Quality Assurance",
    caption: "Ultrasonic and magnetic inspection stations",
    url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "img3",
    span: "",
    title: "Heat Treatment Facility",
    caption: "Carburizing and case hardening chambers",
    url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "img4",
    span: "md:col-span-3",
    title: "Assembly & Output",
    caption: "Final assembly and dispatch floor",
    url: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=1600&q=80",
  },
];

// Lightbox entry/exit — always from/to screen center
const lightboxVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 8,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
};

// Image swap inside lightbox
const imageVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir) => ({
    opacity: 0,
    x: dir > 0 ? -60 : 60,
    transition: { duration: 0.22 },
  }),
};

export function GalleryLightbox() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [dir, setDir] = useState(1);

  const isOpen = selectedIndex !== null;
  const activeImg = isOpen ? IMAGES[selectedIndex] : null;

  const close = useCallback(() => setSelectedIndex(null), []);

  const prev = useCallback(() => {
    if (selectedIndex > 0) {
      setDir(-1);
      setSelectedIndex((i) => i - 1);
    }
  }, [selectedIndex]);

  const next = useCallback(() => {
    if (selectedIndex < IMAGES.length - 1) {
      setDir(1);
      setSelectedIndex((i) => i + 1);
    }
  }, [selectedIndex]);

  const openAt = (index) => {
    setDir(1);
    setSelectedIndex(index);
  };

  // Keyboard nav
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close, prev, next]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <section
      id="facility"
      style={{
        padding: "8rem 1.5rem",
        borderTop: "1px solid var(--border-1)",
        background: "color-mix(in srgb, var(--bg-section) 85%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        transition: "background 0.4s",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Left-aligned header */}
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
                Our Facility
              </span>
            </div>
            <AnimatedHeading
              text="Infrastructure"
              as="h2"
              style={{
                fontSize: "clamp(3rem, 7vw, 5.5rem)",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "-0.04em",
                lineHeight: 0.9,
                marginBottom: "1rem",
                color: "var(--text-1)",
              }}
            />
            <p
              style={{
                color: "var(--text-2)",
                maxWidth: "520px",
                lineHeight: 1.75,
                fontSize: "17px",
              }}
            >
              Inside our sprawling 9500 Sq Ft manufacturing facility, equipped
              with state-of-the-art 5-axis CNC machinery and in-house heat
              treatment.
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  marginLeft: "8px",
                  fontSize: "14px",
                  color: "var(--brand)",
                  fontWeight: 600,
                }}
              >
                <ImageIcon style={{ width: "14px", height: "14px" }} /> Click to
                expand
              </span>
            </p>
          </div>
        </FadeIn>

        {/* Grid */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px" }}
          className="md:grid-cols-3 auto-rows-[250px]"
        >
          {IMAGES.map((img, i) => (
            <FadeIn key={img.id} delay={i * 0.08} className={img.span}>
              <div
                role="button"
                tabIndex={0}
                aria-label={`Open ${img.title}`}
                onClick={() => openAt(i)}
                onKeyDown={(e) => e.key === "Enter" && openAt(i)}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "16px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-1)",
                  cursor: "pointer",
                  width: "100%",
                  height: "100%",
                }}
              >
                <img
                  src={img.url}
                  alt={img.title}
                  loading="lazy"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "saturate(0.65) brightness(0.95)",
                    transition: "filter 0.5s, transform 0.5s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = "saturate(1) brightness(1)";
                    e.currentTarget.style.transform = "scale(1.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter =
                      "saturate(0.65) brightness(0.95)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />

                {/* Hover overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.28)",
                    transition: "background 0.4s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0,0,0,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(0,0,0,0.28)";
                  }}
                />

                {/* Caption bar */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "20px",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.75), transparent)",
                    transform: "translateY(6px)",
                    opacity: 0,
                    transition: "opacity 0.35s, transform 0.35s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0";
                    e.currentTarget.style.transform = "translateY(6px)";
                  }}
                >
                  <h4
                    style={{
                      color: "#fff",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontSize: "14px",
                      marginBottom: "3px",
                    }}
                  >
                    {img.title}
                  </h4>
                  <p
                    style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}
                  >
                    {img.caption}
                  </p>
                </div>

                {/* Expand icon badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.45)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  <span
                    style={{ color: "#fff", fontSize: "16px", lineHeight: 1 }}
                  >
                    ⤢
                  </span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* ── LIGHTBOX — always centered on screen ── */}
      <AnimatePresence>
        {isOpen && activeImg && (
          <>
            {/* Backdrop */}
            <motion.div
              key="lb-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={close}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.92)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                zIndex: 9998,
              }}
            />

            {/* Centered container — fixed, flex, full screen */}
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                // Don't catch click events on the outer container itself
                pointerEvents: "none",
              }}
            >
              {/* Lightbox panel — scale from center */}
              <motion.div
                key="lb-panel"
                variants={lightboxVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{
                  width: "100%",
                  maxWidth: "min(92vw, 1100px)",
                  pointerEvents: "auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                {/* Image area with prev/next arrows */}
                <div style={{ position: "relative", width: "100%" }}>
                  {/* Image with slide animation between images */}
                  <div
                    style={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
                      background: "#000",
                      maxHeight: "72vh",
                    }}
                  >
                    <AnimatePresence initial={false} custom={dir} mode="wait">
                      <motion.img
                        key={activeImg.id}
                        custom={dir}
                        variants={imageVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        src={activeImg.url}
                        alt={activeImg.title}
                        style={{
                          display: "block",
                          width: "100%",
                          maxHeight: "72vh",
                          objectFit: "contain",
                        }}
                      />
                    </AnimatePresence>
                  </div>

                  {/* Prev arrow */}
                  {selectedIndex > 0 && (
                    <button
                      onClick={prev}
                      aria-label="Previous image"
                      style={{
                        position: "absolute",
                        left: "-20px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "46px",
                        height: "46px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.14)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#fff",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.14)";
                      }}
                    >
                      <ChevronLeft style={{ width: "22px", height: "22px" }} />
                    </button>
                  )}

                  {/* Next arrow */}
                  {selectedIndex < IMAGES.length - 1 && (
                    <button
                      onClick={next}
                      aria-label="Next image"
                      style={{
                        position: "absolute",
                        right: "-20px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "46px",
                        height: "46px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.14)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#fff",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.14)";
                      }}
                    >
                      <ChevronRight style={{ width: "22px", height: "22px" }} />
                    </button>
                  )}
                </div>

                {/* Caption row */}
                <div style={{ textAlign: "center" }}>
                  <h4
                    style={{
                      color: "#fff",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      fontSize: "16px",
                      marginBottom: "4px",
                    }}
                  >
                    {activeImg.title}
                  </h4>
                  <p
                    style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}
                  >
                    {activeImg.caption}
                  </p>
                </div>

                {/* Dot navigation */}
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  {IMAGES.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => {
                        setDir(i > selectedIndex ? 1 : -1);
                        setSelectedIndex(i);
                      }}
                      aria-label={`Go to ${img.title}`}
                      style={{
                        width: i === selectedIndex ? "24px" : "8px",
                        height: "8px",
                        borderRadius: "4px",
                        background:
                          i === selectedIndex
                            ? "var(--brand)"
                            : "rgba(255,255,255,0.3)",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        transition: "all 0.3s",
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Close button — top right, always visible */}
              <button
                onClick={close}
                aria-label="Close lightbox"
                style={{
                  position: "fixed",
                  top: "24px",
                  right: "24px",
                  width: "46px",
                  height: "46px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.14)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                  transition: "background 0.2s",
                  pointerEvents: "auto",
                  zIndex: 10000,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.14)";
                }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

export default GalleryLightbox;
