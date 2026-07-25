// ─────────────────────────────────────────────
// ThemeContext.jsx
// Provides isDark + toggleTheme across the entire app.
// Injects CSS variables so every component can use
// var(--brand), var(--bg), var(--text-1) etc.
//
// SETUP (one-time):
//   In tailwind.config.js add:  darkMode: 'class'
//
// SLOT IN main.jsx / index.jsx:
//   import { ThemeProvider } from './components/ThemeContext'
//   <ThemeProvider><App /></ThemeProvider>
//
// USE in any component:
//   import { useTheme } from './components/ThemeContext'
//   const { isDark, toggleTheme } = useTheme()
// ─────────────────────────────────────────────
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({ isDark: false, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  // Persist preference across reloads
  useEffect(() => {
    const saved = localStorage.getItem("saam-theme");
    if (saved === "dark") setIsDark(true);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
      localStorage.setItem("saam-theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("saam-theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((v) => !v);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {/* Inject design-system CSS variables */}
      <style>{`
        /* ── BRAND ─────────────────────────────────────── */
        :root {
          --brand:        #403587;
          --brand-hover:  #2d2460;
          --brand-light:  #ede9ff;
          --brand-muted:  rgba(64,53,135,0.12);
          --brand-border: rgba(64,53,135,0.30);
          --brand-rgb:    64,53,135;

          /* ── LIGHT MODE ─────────────────────────────── */
          --bg:           #faf9ff;
          --bg-card:      #ffffff;
          --bg-section:   #f5f3ff;
          --bg-elevated:  #f0edf8;
          --bg-input:     #f0edf8;
          --bg-overlay:   rgba(250,249,255,0.95);

          --text-1:       #1a1630;
          --text-2:       #4a4470;
          --text-3:       #7a75a0;

          --border-1:     rgba(64,53,135,0.10);
          --border-2:     rgba(64,53,135,0.20);
          --border-3:     rgba(64,53,135,0.35);

          --shadow:       0 2px 20px rgba(64,53,135,0.08);
          --shadow-lg:    0 8px 40px rgba(64,53,135,0.14);

          --canvas-grad-from: #faf9ff;
          --canvas-grad-mid:  rgba(250,249,255,0.70);
        }

        /* ── DARK MODE ──────────────────────────────────── */
        .dark {
          --brand:        #8b7fd8;
          --brand-hover:  #a898e4;
          --brand-light:  #2d2460;
          --brand-muted:  rgba(139,127,216,0.14);
          --brand-border: rgba(139,127,216,0.30);
          --brand-rgb:    139,127,216;

          --bg:           #07060f;
          --bg-card:      #0d0c18;
          --bg-section:   #0a0917;
          --bg-elevated:  #121020;
          --bg-input:     #0f0e1a;
          --bg-overlay:   rgba(7,6,15,0.95);

          --text-1:       #f0eeff;
          --text-2:       #b0abcc;
          --text-3:       #706b90;

          --border-1:     rgba(255,255,255,0.06);
          --border-2:     rgba(255,255,255,0.10);
          --border-3:     rgba(255,255,255,0.18);

          --shadow:       0 2px 20px rgba(0,0,0,0.4);
          --shadow-lg:    0 8px 40px rgba(0,0,0,0.6);

          --canvas-grad-from: #07060f;
          --canvas-grad-mid:  rgba(7,6,15,0.70);
        }

        /* ── GLOBAL RESETS ──────────────────────────────── */
        body {
          background-color: var(--bg);
          color: var(--text-1);
          transition: background-color 0.4s ease, color 0.4s ease;
        }
        ::selection {
          background: var(--brand);
          color: #fff;
        }

        /* ── SCROLLBAR ──────────────────────────────────── */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb {
          background: var(--brand-border);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover { background: var(--brand); }

        /* ── RANGE INPUTS (calculators / sliders) ───────── */
        input[type="range"] { accent-color: var(--brand); }

        /* ── FOCUS RING ─────────────────────────────────── */
        *:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        /* ── RESPONSIVE GRID HELPERS ─────────────────────── */
.grid-2col {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 1024px) {
  .grid-2col { grid-template-columns: 1.1fr 1fr; gap: 3rem; }
}

.footer-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}
@media (min-width: 768px) {
  .footer-row { flex-direction: row; justify-content: space-between; text-align: left; }
}

/* Global overflow guard — prevents any one section from
   creating horizontal scroll on small screens */
html, body, #root { overflow-x: hidden; max-width: 100%; }
* { box-sizing: border-box; }
      `}</style>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;
