import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useAdminTheme } from "../context/AdminThemeContext";

// Sliding track + thumb switch — the common pattern behind most top-liked
// Uiverse.io toggle switches (icon crossfade riding a sliding thumb), styled
// with our own tokens since Uiverse pages can't be scraped for exact source.
export default function ThemeToggle() {
  const { isDark, toggleTheme } = useAdminTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      style={{
        position: "relative",
        width: "52px",
        height: "28px",
        borderRadius: "999px",
        border: "2px solid var(--a-ctl-border)",
        background: isDark ? "#2a2140" : "#ece9f5",
        cursor: "pointer",
        flexShrink: 0,
        padding: 0,
      }}
    >
      <motion.div
        animate={{ x: isDark ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          position: "absolute",
          top: "2px",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: "var(--a-brand-grad)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        {isDark ? <Moon size={11} /> : <Sun size={11} />}
      </motion.div>
    </button>
  );
}
