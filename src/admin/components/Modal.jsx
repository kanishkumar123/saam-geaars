import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";

// Shared centered modal. Entrance motion adapted from Aceternity UI's
// animated-modal registry source: opacity/scale/rotateX/y with a
// spring(stiffness: 260, damping: 15); overlay animates backdropFilter blur
// alongside opacity rather than snapping in, so both layers feel physical.
export default function Modal({
  title,
  icon: Icon,
  accent = "var(--a-brand)",
  onClose,
  children,
  maxWidth = "520px",
}) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const portalTarget =
    document.getElementById("admin-portal-root") || document.body;

  return createPortal(
    <motion.div
      onClick={onClose}
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
      transition={{ duration: 0.22 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(10,8,16,0.55)",
        WebkitBackdropFilter: "blur(8px)",
        padding: "1.5rem",
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.5, rotateX: 30, y: 30 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{
          width: "100%",
          maxWidth,
          maxHeight: "min(88vh, 720px)",
          overflowY: "auto",
          background: "var(--a-card)",
          border: "1px solid var(--a-border)",
          borderRadius: "var(--a-radius-card)",
          boxShadow: "var(--a-shadow-lg)",
          padding: "1.75rem",
          perspective: 800,
        }}
      >
        {title && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {Icon && (
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: `color-mix(in srgb, ${accent} 16%, transparent)`,
                    color: accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} />
                </div>
              )}
              <h2
                className="admin-heading"
                style={{ fontSize: "21px", margin: 0, color: accent }}
              >
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                background: "none",
                border: "none",
                color: "var(--a-text-2)",
                cursor: "pointer",
                padding: "5px",
                borderRadius: "6px",
              }}
            >
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </motion.div>
    </motion.div>,
    portalTarget,
  );
}
