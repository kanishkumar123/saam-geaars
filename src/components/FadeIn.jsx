// ─────────────────────────────────────────────
// FadeIn.jsx
// Drop-in wrapper that fades + slides any element up on scroll.
//
// SLOT IN App.jsx:
//   Wrap any section, card, or block:
//     <FadeIn><YourComponent /></FadeIn>
//   Stagger children by wrapping each in FadeIn with increasing delay:
//     <FadeIn delay={0.1}><Card /></FadeIn>
//     <FadeIn delay={0.2}><Card /></FadeIn>
//     <FadeIn delay={0.3}><Card /></FadeIn>
// ─────────────────────────────────────────────
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function FadeIn({
  children,
  className = "",
  delay = 0,
  duration = 0.65,
  y = 32,
  x = 0,
  once = true,
  as: Tag = "div",
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-8% 0px" });

  const MotionTag = motion[Tag] ?? motion.div;

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, x }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y, x }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
