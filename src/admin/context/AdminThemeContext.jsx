import { createContext, useContext, useState, useEffect } from "react";

const AdminThemeContext = createContext({ isDark: false, toggleTheme: () => {} });

export function AdminThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("saam-admin-theme");
    if (saved === "dark") setIsDark(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("saam-admin-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark((v) => !v);

  return (
    <AdminThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div
        className={`admin-root ${isDark ? "admin-dark" : "admin-light"}`}
        style={{ minHeight: "100vh" }}
      >
        <style>{`
          .admin-root {
            --a-bg:            #f7f6f8;
            --a-bg-elevated:   #eeecf1;
            --a-card:          #ffffff;
            --a-border:        #e4e2e8;
            --a-text-1:        #17151d;
            --a-text-2:        #5c5866;
            --a-text-3:        #918d99;

            --a-brand:         #6d28d9;
            --a-brand-hover:   #5b21b6;
            --a-brand-tint:    rgba(109,40,217,0.10);
            --a-brand-border:  rgba(109,40,217,0.28);
            --a-brand-grad:    linear-gradient(135deg, #8b5cf6, #6d28d9);

            --a-stage-active:  linear-gradient(135deg, #f59e0b, #dc2626);
            --a-stage-active-glow: 0 0 0 4px rgba(245,158,11,0.18);
            --a-stage-complete: #b8873d;
            --a-stage-pending-fill: #eceaef;
            --a-stage-pending-border: #d8d5dd;
            --a-stage-blocked: #dc2626;

            --a-shadow: 0 2px 14px rgba(23,21,29,0.06);
            --a-shadow-lg: 0 10px 34px rgba(23,21,29,0.10);
            --a-radius-card: 14px;
            --a-radius-panel: 20px;

            --a-success: #16a34a;
            --a-danger: #dc2626;

            /* Neobrutalist control layer (buttons, inputs, dropdown, search) —
               scoped to interactive controls only, per neobrutalism.dev's
               border+offset-shadow language, adapted to our ink/purple tones
               instead of the library's default black/yellow. */
            --a-ctl-border: #241541;
            --a-ctl-shadow: #241541;
            --a-ctl-shadow-danger: #7a1414;
            --a-ctl-offset: 3px;
            --a-ctl-radius: 10px;

            --a-font-heading: "Archivo Black", -apple-system, sans-serif;
          }

          .admin-root.admin-dark {
            --a-bg:            #141416;
            --a-bg-elevated:   #1c1c1e;
            --a-card:          #1c1c1e;
            --a-border:        #333335;
            --a-text-1:        #f4f4f5;
            --a-text-2:        #b6b4ba;
            --a-text-3:        #8a8a8e;

            --a-brand:         #a78bfa;
            --a-brand-hover:   #c4b5fd;
            --a-brand-tint:    rgba(167,139,250,0.14);
            --a-brand-border:  rgba(167,139,250,0.32);
            --a-brand-grad:    linear-gradient(135deg, #7c3aed, #5b21b6);

            --a-stage-active:  linear-gradient(135deg, #f59e0b, #dc2626);
            --a-stage-active-glow: 0 0 0 4px rgba(245,158,11,0.22);
            --a-stage-complete: #b8873d;
            --a-stage-pending-fill: #262628;
            --a-stage-pending-border: #3a3a3d;
            --a-stage-blocked: #ef4444;

            --a-shadow: 0 2px 20px rgba(0,0,0,0.4);
            --a-shadow-lg: 0 10px 40px rgba(0,0,0,0.55);

            --a-success: #22c55e;
            --a-danger: #ef4444;

            /* Dark-mode neobrutalism reworked: a bright neutral border cuts
               a clean edge against the dark surface. The offset shadow must
               be LIGHT here — a black shadow is invisible against a near-black
               card, which is why the first attempt at this silhouette read as
               flat. A light-gray shadow keeps the same bold carved-block look
               as light mode's dark shadow, just inverted for contrast. */
            --a-ctl-border: #e4e4e7;
            --a-ctl-shadow: #d4d4d8;
            --a-ctl-shadow-danger: #fca5a5;
            --a-ctl-offset: 3px;
            --a-ctl-radius: 10px;
          }

          .admin-root {
            background: var(--a-bg);
            color: var(--a-text-1);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 16px;
            transition: background 0.25s ease, color 0.25s ease;
          }
          .admin-heading {
            font-family: var(--a-font-heading);
            font-weight: 400;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
          /* Subtle drop shadow behind headings that need it — tuned
             separately per theme since a shadow calibrated for dark mode
             reads as mud in light mode and vice versa. */
          .admin-root.admin-light .admin-heading-shadow {
            text-shadow: 2px 2px 3px rgba(23,21,29,0.14), 1px 1px 1px rgba(23,21,29,0.1);
          }
          .admin-root.admin-dark .admin-heading-shadow {
            text-shadow: 2px 2px 4px rgba(0,0,0,0.6), 0 0 18px rgba(167,139,250,0.18);
          }
          .admin-root * { box-sizing: border-box; }
          .admin-root ::selection { background: var(--a-brand); color: #fff; }
          .admin-root button { font-family: inherit; }

          /* ── Neobrutalist controls: inputs, search, dropdown shell ──────
             Pattern adapted from neobrutalism.dev's button/input source:
             solid border + hard offset shadow that compresses on focus,
             giving tactile feedback — scoped to controls, not containers. */
          .admin-root input:not([type="checkbox"]), .admin-root select, .admin-root textarea {
            font-family: inherit;
            background: var(--a-card);
            color: var(--a-text-1);
            border: 2px solid var(--a-ctl-border);
            border-radius: var(--a-ctl-radius);
            padding: 13px 17px;
            font-size: 16px;
            min-height: 46px;
            outline: none;
            box-shadow: var(--a-ctl-offset) var(--a-ctl-offset) 0 0 var(--a-ctl-shadow);
            transition: transform 0.12s ease, box-shadow 0.12s ease;
          }
          .admin-root input:not([type="checkbox"]):focus, .admin-root select:focus, .admin-root textarea:focus {
            transform: translate(1px, 1px);
            box-shadow: 1px 1px 0 0 var(--a-ctl-shadow);
          }
          .admin-root input[type="checkbox"] {
            width: 18px;
            height: 18px;
            accent-color: var(--a-brand);
          }

          /* ── Neobrutalist buttons — shared Button component classes ───── */
          .admin-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            font-family: inherit;
            font-weight: 700;
            font-size: 15px;
            padding: 12px 22px;
            min-height: 46px;
            border-radius: var(--a-ctl-radius);
            border: 2px solid var(--a-ctl-border);
            box-shadow: var(--a-ctl-offset) var(--a-ctl-offset) 0 0 var(--a-ctl-shadow);
            cursor: pointer;
            transition: transform 0.1s ease, box-shadow 0.1s ease, background 0.15s ease;
            white-space: nowrap;
          }
          .admin-btn:active {
            transform: translate(var(--a-ctl-offset), var(--a-ctl-offset));
            box-shadow: 0 0 0 0 var(--a-ctl-shadow);
          }
          .admin-btn:disabled {
            cursor: not-allowed;
            opacity: 0.55;
          }
          .admin-btn-primary {
            background: var(--a-brand-grad);
            color: #fff;
          }
          .admin-btn-secondary {
            background: var(--a-bg-elevated);
            color: var(--a-text-1);
          }
          .admin-btn-danger {
            background: var(--a-danger);
            color: #fff;
            border-color: var(--a-ctl-shadow-danger);
            box-shadow: var(--a-ctl-offset) var(--a-ctl-offset) 0 0 var(--a-ctl-shadow-danger);
          }
          .admin-btn-danger:active {
            box-shadow: 0 0 0 0 var(--a-ctl-shadow-danger);
          }
          .admin-btn-sm {
            padding: 7px 14px;
            min-height: 38px;
            font-size: 14px;
            border-width: 2px;
          }

          /* ── Sidebar nav microinteraction ─────────────────────────────── */
          .admin-nav-item {
            transition: background 0.18s ease, color 0.18s ease, transform 0.15s cubic-bezier(0.22,1,0.36,1);
          }
          .admin-nav-item:hover:not(.admin-nav-active) {
            transform: translateX(3px);
          }
          .admin-nav-active {
            box-shadow: 0 4px 18px -4px var(--a-brand-border);
          }

          /* ── Card corner actions (edit/delete) — persistent tint, deeper on hover ── */
          .admin-card-action {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.15s ease, color 0.15s ease, transform 0.12s ease;
          }
          .admin-card-action-edit {
            background: var(--a-brand-tint);
            color: var(--a-brand);
          }
          .admin-card-action-edit:hover {
            background: var(--a-brand);
            color: #fff;
            transform: translateY(-1px);
          }
          .admin-card-action-delete {
            background: rgba(220,38,38,0.12);
            color: var(--a-danger);
          }
          .admin-card-action-delete:hover {
            background: var(--a-danger);
            color: #fff;
            transform: translateY(-1px);
          }

          /* ── react-day-picker theming ──────────────────────────────────── */
          .admin-datepicker .rdp {
            --rdp-accent-color: var(--a-brand);
            --rdp-accent-background-color: var(--a-brand-tint);
            --rdp-today-color: var(--a-brand);
            margin: 0;
            color: var(--a-text-1);
          }
          .admin-datepicker .rdp-weekday {
            color: var(--a-text-3);
          }
          .admin-datepicker .rdp-day_button {
            color: var(--a-text-1);
          }
          .admin-datepicker .rdp-day_button:hover:not([disabled]) {
            background: var(--a-bg-elevated);
          }
          .admin-datepicker .rdp-selected .rdp-day_button {
            background: var(--a-brand-grad);
            color: #fff;
            border-color: transparent;
          }
          .admin-datepicker .rdp-month_caption {
            color: var(--a-text-1);
            font-weight: 700;
          }
          .admin-datepicker .rdp-nav button {
            color: var(--a-text-2);
          }
          /* Quick month/year jump (captionLayout="dropdown") */
          .admin-datepicker .rdp-dropdowns {
            gap: 6px;
          }
          .admin-datepicker .rdp-months_dropdown,
          .admin-datepicker .rdp-years_dropdown {
            background: var(--a-bg-elevated);
            color: var(--a-text-1);
            border: 1px solid var(--a-border);
            border-radius: 6px;
            padding: 3px 22px 3px 6px;
            font-size: 13.5px;
            font-weight: 600;
            min-height: auto;
            box-shadow: none;
            width: auto;
          }

          /* ── Job card tile hover (shared by Job Cards list + Dashboard) ── */
          .admin-jc-card { transition: transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s ease, border-color 0.2s ease; }
          .admin-jc-card:hover { transform: translateY(-4px); box-shadow: var(--a-shadow-lg); border-color: var(--a-brand-border); }

          /* ── Skeleton loading state ──────────────────────────────────── */
          .admin-skeleton {
            background: linear-gradient(90deg, var(--a-bg-elevated) 25%, var(--a-border) 50%, var(--a-bg-elevated) 75%);
            background-size: 200% 100%;
            animation: admin-skeleton-shimmer 1.4s ease-in-out infinite;
          }
          @keyframes admin-skeleton-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }

        `}</style>
        {children}
        {/* Portal target for Modal — must stay inside .admin-root so the
            CSS custom properties (--a-brand-grad, --a-ctl-border, etc.)
            are still in scope for anything rendered via createPortal. */}
        <div id="admin-portal-root" />
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}
