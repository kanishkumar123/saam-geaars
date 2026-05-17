// GalleryLightbox.jsx
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import FadeIn from "./FadeIn";
import AnimatedHeading from "./AnimatedHeading";

import infra1 from "../assets/infra1.jpeg";
import infra2 from "../assets/infra2.jpeg";
import infra3 from "../assets/infra3.jpeg";
import infra4 from "../assets/infra4.jpeg";

const IMAGES = [
  {
    id: "img1",
    title: "Unit 1",
    caption: "Exterior view of our manufacturing facility",
    url: infra1,
  },
  {
    id: "img2",
    title: "Unit 2",
    caption: "Interior view of our manufacturing facility",
    url: infra2,
  },
  {
    id: "img3",
    title: "Gear Wheel",
    caption: "Precision-manufactured gear wheel component",
    url: infra3,
  },
  {
    id: "img4",
    title: "6 Row Special 10T Sprocket",
    caption: "Specialized 6 row 10T sprocket component",
    url: infra4,
  },
];

const lightboxVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 8,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

const imageVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir) => ({
    opacity: 0,
    x: dir > 0 ? -60 : 60,
    transition: { duration: 0.2 },
  }),
};

export function GalleryLightbox() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [dir, setDir] = useState(1);

  const isOpen = selectedIndex !== null;
  const activeImg = isOpen ? IMAGES[selectedIndex] : null;

  const close = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const openAt = useCallback((index) => {
    setDir(1);
    setSelectedIndex(index);
  }, []);

  const prev = useCallback(() => {
    setSelectedIndex((current) => {
      if (current === null || current <= 0) return current;
      setDir(-1);
      return current - 1;
    });
  }, []);

  const next = useCallback(() => {
    setSelectedIndex((current) => {
      if (current === null || current >= IMAGES.length - 1) return current;
      setDir(1);
      return current + 1;
    });
  }, []);

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

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const lightbox =
    isOpen && activeImg ? (
      <AnimatePresence>
        <motion.div
          key="gallery-lightbox"
          className="gallery-lightbox-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            className="gallery-lightbox-backdrop"
            aria-label="Close lightbox"
            onClick={close}
          />

          <motion.div
            className="gallery-lightbox-panel"
            variants={lightboxVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label={activeImg.title}
          >
            <div className="gallery-lightbox-image-wrap">
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
                  className="gallery-lightbox-image"
                />
              </AnimatePresence>

              {selectedIndex > 0 && (
                <button
                  className="gallery-nav gallery-nav-left"
                  onClick={prev}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {selectedIndex < IMAGES.length - 1 && (
                <button
                  className="gallery-nav gallery-nav-right"
                  onClick={next}
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            <div className="gallery-lightbox-caption">
              <h4>{activeImg.title}</h4>
              <p>{activeImg.caption}</p>
            </div>

            <div className="gallery-dots">
              {IMAGES.map((img, i) => (
                <button
                  key={img.id}
                  aria-label={`Go to ${img.title}`}
                  className={`gallery-dot ${
                    i === selectedIndex ? "active" : ""
                  }`}
                  onClick={() => {
                    setDir(i > selectedIndex ? 1 : -1);
                    setSelectedIndex(i);
                  }}
                />
              ))}
            </div>
          </motion.div>

          <button
            className="gallery-close"
            onClick={close}
            aria-label="Close lightbox"
          >
            <X size={22} />
          </button>
        </motion.div>
      </AnimatePresence>
    ) : null;

  return (
    <section id="facility" className="gallery-section">
      <style>{`
        .gallery-section {
          padding: 4rem 1.5rem;
          border-top: 1px solid var(--border-1);
          background: color-mix(in srgb, var(--bg-section) 85%, transparent);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: background 0.4s;
        }

        .gallery-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        .gallery-header {
          margin-bottom: 3.5rem;
        }

        .gallery-label-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 1.5rem;
        }

        .gallery-label-line {
          height: 2px;
          width: 40px;
          background: var(--brand);
          border-radius: 1px;
        }

        .gallery-label {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--brand);
        }

        .gallery-helper {
          color: var(--text-2);
          max-width: 520px;
          line-height: 1.75;
          font-size: 17px;
        }

        .gallery-helper span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: var(--brand);
          font-weight: 600;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 700px) {
          .gallery-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        .gallery-card {
          position: relative;
          min-height: 350px;
          overflow: hidden;
          border-radius: 18px;
          background: var(--bg-card);
          border: 1px solid var(--border-1);
          cursor: pointer;
          isolation: isolate;
        }

        .gallery-card img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(0.75) brightness(0.95);
          transform: scale(1);
          transition: filter 0.5s ease, transform 0.5s ease;
        }

        .gallery-card:hover img {
          filter: saturate(1) brightness(1);
          transform: scale(1.04);
        }

        .gallery-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.28);
          transition: background 0.35s ease;
          z-index: 1;
        }

        .gallery-card:hover .gallery-overlay {
          background: rgba(0, 0, 0, 0.08);
        }

        .gallery-card-caption {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 22px;
          z-index: 2;
          background: linear-gradient(to top, rgba(0,0,0,0.78), transparent);
          transform: translateY(8px);
          opacity: 0;
          transition: opacity 0.35s ease, transform 0.35s ease;
        }

        .gallery-card:hover .gallery-card-caption {
          opacity: 1;
          transform: translateY(0);
        }

        .gallery-card-caption h4 {
          color: #fff;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 14px;
          margin: 0 0 4px;
        }

        .gallery-card-caption p {
          color: rgba(255,255,255,0.72);
          font-size: 13px;
          margin: 0;
        }

        .gallery-expand-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: rgba(0,0,0,0.48);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 17px;
          line-height: 1;
          opacity: 0;
          z-index: 3;
          transition: opacity 0.3s ease;
        }

        .gallery-card:hover .gallery-expand-badge {
          opacity: 1;
        }

        .gallery-lightbox-root {
          position: fixed;
          inset: 0;
          z-index: 2147483647;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 22px;
        }

        .gallery-lightbox-backdrop {
          position: fixed;
          inset: 0;
          border: none;
          padding: 0;
          margin: 0;
          background: rgba(0,0,0,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          cursor: zoom-out;
        }

        .gallery-lightbox-panel {
          position: relative;
          width: min(92vw, 1100px);
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          z-index: 2;
        }

        .gallery-lightbox-image-wrap {
          position: relative;
          width: 100%;
          border-radius: 18px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 24px 80px rgba(0,0,0,0.72);
        }

        .gallery-lightbox-image {
          display: block;
          width: 100%;
          max-height: 72vh;
          object-fit: contain;
          background: #000;
        }

        .gallery-lightbox-caption {
          text-align: center;
        }

        .gallery-lightbox-caption h4 {
          color: #fff;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 16px;
          margin: 0 0 4px;
        }

        .gallery-lightbox-caption p {
          color: rgba(255,255,255,0.58);
          font-size: 14px;
          margin: 0;
        }

        .gallery-nav,
        .gallery-close {
          border: 1px solid rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.14);
          backdrop-filter: blur(8px);
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .gallery-nav:hover,
        .gallery-close:hover {
          background: rgba(255,255,255,0.26);
          transform: scale(1.04);
        }

        .gallery-nav {
          position: absolute;
          top: 50%;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          transform: translateY(-50%);
        }

        .gallery-nav:hover {
          transform: translateY(-50%) scale(1.04);
        }

        .gallery-nav-left {
          left: 14px;
        }

        .gallery-nav-right {
          right: 14px;
        }

        .gallery-close {
          position: fixed;
          top: 24px;
          right: 24px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          z-index: 3;
        }

        .gallery-dots {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: center;
        }

        .gallery-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          border: none;
          padding: 0;
          background: rgba(255,255,255,0.32);
          cursor: pointer;
          transition: width 0.3s ease, background 0.3s ease;
        }

        .gallery-dot.active {
          width: 26px;
          background: var(--brand);
        }

        @media (max-width: 640px) {
          .gallery-section {
            padding: 5rem 1rem;
          }

          .gallery-card {
            min-height: 230px;
          }

          .gallery-nav {
            width: 42px;
            height: 42px;
          }

          .gallery-close {
            top: 16px;
            right: 16px;
          }
        }
      `}</style>

      <div className="gallery-container">
        <FadeIn>
          <div className="gallery-header">
            <div className="gallery-label-row">
              <div className="gallery-label-line" />
              <span className="gallery-label">Our Facility</span>
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

            <p className="gallery-helper">
              <span>
                <ImageIcon style={{ width: "14px", height: "14px" }} />
                Click any image to expand
              </span>
            </p>
          </div>
        </FadeIn>

        <div className="gallery-grid">
          {IMAGES.map((img, i) => (
            <motion.div
              key={img.id}
              className="gallery-card"
              role="button"
              tabIndex={0}
              aria-label={`Open ${img.title}`}
              onClick={() => openAt(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openAt(i);
                }
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.45,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <img src={img.url} alt={img.title} loading="lazy" />

              <div className="gallery-overlay" />

              <div className="gallery-card-caption">
                <h4>{img.title}</h4>
                <p>{img.caption}</p>
              </div>

              <div className="gallery-expand-badge">⤢</div>
            </motion.div>
          ))}
        </div>
      </div>

      {typeof document !== "undefined" &&
        lightbox &&
        createPortal(lightbox, document.body)}
    </section>
  );
}

export default GalleryLightbox;
