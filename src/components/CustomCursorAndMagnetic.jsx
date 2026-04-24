// ─────────────────────────────────────────────
// CustomCursorAndMagnetic.jsx  (violet, CSS-var aware)
// ─────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const cursorX  = useMotionValue(-200);
  const cursorY  = useMotionValue(-200);
  const dotX     = useMotionValue(-200);
  const dotY     = useMotionValue(-200);
  const [hovering, setHovering] = useState(false);
  const [visible,  setVisible]  = useState(false);
  const isTouch = useRef(false);

  const springX = useSpring(cursorX, { stiffness: 350, damping: 28, mass: 0.5 });
  const springY = useSpring(cursorY, { stiffness: 350, damping: 28, mass: 0.5 });

  useEffect(() => {
    const onTouch = () => { isTouch.current = true; };
    window.addEventListener("touchstart", onTouch, { once: true });

    const onMove = (e) => {
      if (isTouch.current) return;
      cursorX.set(e.clientX); cursorY.set(e.clientY);
      dotX.set(e.clientX);   dotY.set(e.clientY);
      setVisible(true);
    };
    const onOver  = (e) => { if (e.target.closest("[data-cursor='hover']")) setHovering(true);  };
    const onOut   = (e) => { if (e.target.closest("[data-cursor='hover']")) setHovering(false); };
    const onLeave = () => setVisible(false);
    const onEnter = () => { if (!isTouch.current) setVisible(true); };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("touchstart", onTouch);
    };
  }, []);

  // Global cursor:none on pointer devices
  useEffect(() => {
    const s = document.createElement("style");
    s.id = "custom-cursor-hide";
    s.textContent = `@media(pointer:fine){*,*::before,*::after{cursor:none!important}}`;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  if (!visible) return null;

  const ring = hovering ? 46 : 28;
  const dot  = hovering ? 6  : 4;

  return (
    <>
      {/* Ring */}
      <motion.div aria-hidden="true"
        style={{
          position: "fixed", top: 0, left: 0,
          x: springX, y: springY,
          translateX: "-50%", translateY: "-50%",
          width: ring, height: ring, borderRadius: "50%",
          border: hovering ? "2px solid var(--brand)" : "1.5px solid color-mix(in srgb, var(--brand) 60%, transparent)",
          background: hovering ? "var(--brand-muted)" : "transparent",
          pointerEvents: "none", zIndex: 9999,
          transition: "width 0.3s ease, height 0.3s ease, border 0.3s ease, background 0.3s ease",
        }}
      />
      {/* Dot */}
      <motion.div aria-hidden="true"
        style={{
          position: "fixed", top: 0, left: 0,
          x: dotX, y: dotY,
          translateX: "-50%", translateY: "-50%",
          width: dot, height: dot, borderRadius: "50%",
          background: "var(--brand)",
          pointerEvents: "none", zIndex: 10000,
          transition: "width 0.2s ease, height 0.2s ease",
        }}
      />
    </>
  );
}

// ── MagneticButton ──────────────────────────────────────────────────
export function MagneticButton({ children, strength = 0.28, className = "" }) {
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 200, damping: 18, mass: 0.5 });
  const y = useSpring(0, { stiffness: 200, damping: 18, mass: 0.5 });

  const onMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width  / 2)) * strength);
    y.set((e.clientY - (rect.top  + rect.height / 2)) * strength);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} className={className}
      style={{ x, y, display: "inline-block" }}
      onMouseMove={onMove} onMouseLeave={onLeave}
      data-cursor="hover"
    >
      {children}
    </motion.div>
  );
}

export default CustomCursor;
