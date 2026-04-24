// ─────────────────────────────────────────────
// AnimatedHeading.jsx  (v2 — style prop fixed)
// Word-by-word blur + slide-up stagger reveal.
// Accepts both className (Tailwind) and style (inline).
// ─────────────────────────────────────────────
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const wordVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function AnimatedHeading({
  text,
  highlight = "",
  as: Tag = "h1",
  className = "",
  style = {}, // ← now properly accepted and merged
  delay = 0,
  stagger = 0.07,
  once = true,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-8% 0px" });

  const lines = Array.isArray(text) ? text : [text];
  const highlightSet = new Set(
    highlight
      .split(" ")
      .map((w) => w.trim())
      .filter(Boolean),
  );

  const allWords = lines.flatMap((line, li) =>
    line.split(" ").map((word, wi, arr) => ({
      word,
      li,
      isLastInLine: wi === arr.length - 1,
    })),
  );

  return (
    <Tag
      ref={ref}
      className={className}
      aria-label={lines.join(" ")}
      style={{ display: "block", ...style }} // ← merge caller styles
    >
      <motion.span
        aria-hidden="true"
        style={{ display: "inline" }}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{
          visible: {
            transition: { delayChildren: delay, staggerChildren: stagger },
          },
        }}
      >
        {allWords.map(({ word, li, isLastInLine }, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              overflow: "hidden",
              verticalAlign: "bottom",
              lineHeight: "inherit",
            }}
          >
            <motion.span
              variants={wordVariants}
              style={{
                display: "inline-block",
                color: highlightSet.has(word) ? "var(--brand)" : "inherit",
                marginRight:
                  isLastInLine && li < lines.length - 1 ? 0 : "0.26em",
              }}
            >
              {word}
            </motion.span>
            {isLastInLine && li < lines.length - 1 && <br />}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
