import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeContext";
import logoImg from "../assets/saam-geaars.png";

const NAV_LINKS = [
  { label: "Journey", href: "#process" },
  { label: "Products", href: "#products" },
  { label: "Facility", href: "#facility" },
  { label: "Contact", href: "#contact" },
];

const SECTION_IDS = ["products", "process", "facility", "contact"];

function useActiveSection(ids) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    const observers = ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const o = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) setActive(id);
        },
        { threshold: 0.2, rootMargin: "-80px 0px -20% 0px" },
      );
      o.observe(el);
      return o;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);
  return active;
}

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const activeSection = useActiveSection(SECTION_IDS);
  const activeHref = activeSection ? `#${activeSection}` : null;

  // Custom smooth scroll handler
  const handleSmoothScroll = (e, href) => {
    e.preventDefault();
    if (href === "#top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const targetId = href.replace("#", "");
    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] md:w-[850px] font-sans">
      {/* The Main Pill Container */}
      <div
        style={{
          background: "var(--bg-overlay, rgba(255, 255, 255, 0.8))",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid var(--border-1, rgba(0,0,0,0.08))",
          boxShadow:
            "0 30px 60px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)",
          borderRadius: "2rem",
          overflow: "hidden",
          transition: "background 0.3s, border-color 0.3s",
        }}
      >
        {/* --- TOP HEADER ROW (Always Visible) --- */}
        <div className="flex items-center justify-between px-6 py-4 relative z-20 bg-transparent">
          {/* Logo */}
          <a
            href="#top"
            onClick={(e) => handleSmoothScroll(e, "#top")}
            className="flex items-center gap-3 select-none"
            style={{ textDecoration: "none", cursor: "pointer" }}
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
            <div style={{ lineHeight: 1 }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--text-1, #111)",
                }}
              >
                Saam
                <span style={{ color: "var(--brand, #3b82f6)" }}>Geaars</span>
              </div>
            </div>
          </a>

          {/* Quick Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = activeHref === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    textDecoration: "none",
                    color: isActive
                      ? "var(--brand, #3b82f6)"
                      : "var(--text-2, #666)",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      e.currentTarget.style.color = "var(--text-1, #111)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      e.currentTarget.style.color = "var(--text-2, #666)";
                  }}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Right Controls: Theme Toggle Only */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                border: "1px solid var(--border-2, rgba(0,0,0,0.1))",
                background: "var(--bg-elevated, rgba(0,0,0,0.03))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-2, #555)",
                transition: "all 0.2s",
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.span
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: "flex" }}
                  >
                    <Sun style={{ width: "15px", height: "15px" }} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: "flex" }}
                  >
                    <Moon style={{ width: "15px", height: "15px" }} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
