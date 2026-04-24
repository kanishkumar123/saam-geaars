// ScrollProgressBar.jsx — uses CSS var(--brand) for colour
import { motion } from "framer-motion";

export function ScrollProgressBar({ scrollYProgress }) {
  return (
    <motion.div
      aria-hidden="true"
      style={{
        scaleX: scrollYProgress,
        position: "fixed",
        top: 0, left: 0, right: 0,
        height: "3px",
        background: "var(--brand)",
        transformOrigin: "left",
        zIndex: 200,
        pointerEvents: "none",
      }}
    />
  );
}

export default ScrollProgressBar;
