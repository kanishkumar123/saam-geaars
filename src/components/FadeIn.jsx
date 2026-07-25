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
