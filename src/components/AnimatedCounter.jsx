import { useRef, useEffect } from "react";
import { useMotionValue, useInView, animate } from "framer-motion";

export default function AnimatedCounter({
  to,
  duration = 1.8,
  prefix = "",
  suffix = "",
  className = "",
  decimals = 0,
}) {
  const ref = useRef(null);
  const displayRef = useRef(null);
  const motionVal = useMotionValue(0);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionVal, to, {
      duration,
      ease: "easeOut",
      onUpdate(v) {
        if (displayRef.current) {
          const rounded =
            decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString();
          displayRef.current.textContent = `${prefix}${rounded}${suffix}`;
        }
      },
    });
    return controls.stop;
  }, [isInView, to, duration, prefix, suffix, decimals, motionVal]);

  return (
    <span ref={ref} className={className}>
      <span ref={displayRef}>
        {prefix}0{suffix}
      </span>
    </span>
  );
}
