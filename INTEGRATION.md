# Saam Geaars — Integration Guide (v3)
Light-mode default · Violet brand (#403587) · Dark mode toggle in nav

---

## 1. Project setup

### Install dependencies
```bash
npm install framer-motion lucide-react @react-three/fiber @react-three/drei three
# Optional — for react-helmet MetaTags component:
npm install react-helmet-async
```

### tailwind.config.js — add darkMode
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",   // ← required for dark mode toggle
  theme: { extend: {} },
  plugins: [],
}
```

### .env (project root)
```
VITE_WEB3FORMS_KEY=your_web3forms_key_here
```
Get a free key at https://web3forms.com (same service as the original enquiry form).

---

## 2. File structure

Copy every `.jsx` file into `src/components/`. Your `App.jsx` goes into `src/`.

```
src/
├── App.jsx                          ← drop-in replacement (light mode, violet, all features)
├── main.jsx                         ← add ThemeProvider here (see step 3)
└── components/
    ├── ThemeContext.jsx              ← design system CSS variables + dark mode provider
    ├── ActiveNav.jsx                 ← nav with dark mode toggle + section tracking
    ├── AnimatedHeading.jsx           ← word-by-word blur+slide reveal
    ├── AnimatedCounter.jsx           ← count-up on scroll
    ├── FadeIn.jsx                    ← scroll-triggered entrance wrapper
    ├── ScrollProgressBar.jsx         ← violet progress bar at top
    ├── CustomCursorAndMagnetic.jsx   ← spring cursor + MagneticButton
    ├── WhatsAppButton.jsx            ← re-exports from QuoteFormAndWhatsApp
    ├── QuoteForm.jsx                 ← re-exports from QuoteFormAndWhatsApp
    ├── QuoteFormAndWhatsApp.jsx      ← 3-step form + WhatsApp button (source)
    ├── IndustryMarqueeAndStatsBanner.jsx
    ├── CertificationsBadges.jsx
    ├── TestimonialsCarousel.jsx
    ├── ProductFlipCards.jsx          ← 3D flip cards (no spec table, no calc)
    ├── GalleryLightbox.jsx
    ├── GoogleMapGrainDivider.jsx     ← GoogleMap + GrainOverlay + SectionDivider
    └── StructuredDataAndMetaTags.jsx
```

**Removed from this version (not needed):**
- `GearRatioCalculator.jsx` — removed from site
- `ProductSpecTable.jsx` — removed from site
- `GearVisualiser.jsx` — removed from site
- `TorqueGauge.jsx` — only used by GearRatioCalculator
- `MobileNav.jsx` — replaced by ActiveNav

---

## 3. main.jsx — wrap App in ThemeProvider

The `ThemeProvider` in `ThemeContext.jsx` injects all CSS design-system variables
and the `dark` class toggle. It must wrap `<App />` at the root.

```jsx
// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./components/ThemeContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

> **Note:** `App.jsx` already wraps itself in `ThemeProvider` as a fallback,
> so it works standalone too. If you add it to `main.jsx`, remove the
> `ThemeProvider` wrapper inside `App.jsx` to avoid double-wrapping.

---

## 4. public/index.html — meta tags

Paste this inside `<head>` in `public/index.html`.
Replace `YOUR_SITE_URL` and `YOUR_OG_IMAGE_URL`.

```html
<!-- Primary -->
<title>Saam Geaars — Precision Gear & Gearbox Manufacturer, Coimbatore</title>
<meta name="description" content="Saam Geaars manufactures precision gears, worm gearboxes, helical gearboxes and industrial sprockets in Coimbatore, India. Est. 2001. +91 98430 18244." />
<meta name="keywords" content="gear manufacturer coimbatore, gearbox manufacturer india, precision gears, helical gears, worm gearbox, sprockets, CNC machining coimbatore" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="YOUR_SITE_URL" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:url" content="YOUR_SITE_URL" />
<meta property="og:title" content="Saam Geaars — Precision Gear & Gearbox Manufacturer, Coimbatore" />
<meta property="og:description" content="Over two decades of precision gear manufacturing. Helical gears, worm gearboxes, sprockets. Module up to 30, OD up to 3m." />
<meta property="og:image" content="YOUR_OG_IMAGE_URL" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="en_IN" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Saam Geaars — Precision Gear & Gearbox Manufacturer" />
<meta name="twitter:image" content="YOUR_OG_IMAGE_URL" />

<!-- Local SEO -->
<meta name="geo.region" content="IN-TN" />
<meta name="geo.placename" content="Coimbatore" />
<meta name="geo.position" content="11.0168;76.9558" />
```

---

## 5. Design system — CSS variables reference

All variables are defined in `ThemeContext.jsx` and auto-switch on `.dark`.

| Variable | Light | Dark | Usage |
|---|---|---|---|
| `--brand` | `#403587` | `#8b7fd8` | All violet accents, icons, underlines |
| `--brand-hover` | `#2d2460` | `#a898e4` | Button hover state |
| `--brand-muted` | `rgba(64,53,135,0.12)` | `rgba(139,127,216,0.14)` | Icon backgrounds, card tints |
| `--brand-border` | `rgba(64,53,135,0.30)` | `rgba(139,127,216,0.30)` | Accented borders |
| `--bg` | `#faf9ff` | `#07060f` | Page background |
| `--bg-card` | `#ffffff` | `#0d0c18` | Card surfaces |
| `--bg-section` | `#f5f3ff` | `#0a0917` | Section backgrounds |
| `--bg-elevated` | `#f0edf8` | `#121020` | Inputs, elevated elements |
| `--text-1` | `#1a1630` | `#f0eeff` | Primary text |
| `--text-2` | `#4a4470` | `#b0abcc` | Body text |
| `--text-3` | `#7a75a0` | `#706b90` | Captions, labels |
| `--border-1` | `rgba(64,53,135,0.10)` | `rgba(255,255,255,0.06)` | Subtle dividers |
| `--shadow` | soft violet | dark | Card shadows |

To use in any component's inline style:
```jsx
style={{ color: "var(--text-1)", background: "var(--bg-card)", border: "1px solid var(--border-1)" }}
```

---

## 6. What was removed vs original

| Component | Status | Reason |
|---|---|---|
| `TorqueCalculator` | ❌ Removed | Replaced by hero stat strip |
| `GearRatioCalculator` | ❌ Removed | Per user request |
| `ProductSpecTable` | ❌ Removed | Per user request |
| `GearVisualiser` | ❌ Removed | Per user request |
| Process step stats strip | ❌ Removed | Per user request |
| `EnquiryForm` | ✅ Replaced | → 3-step `QuoteForm` |
| `FacilityGallery` | ✅ Replaced | → `GalleryLightbox` with layoutId morphing |
| Static nav | ✅ Replaced | → `ActiveNav` with scroll tracking + dark toggle |
| Orange brand color | ✅ Changed | → Violet `rgb(64,53,135)` / `#403587` |
| Dark-first theme | ✅ Changed | → Light mode default, dark mode toggle |
| Small font sizes | ✅ Fixed | All body text ≥ 15px, descriptions 17–19px |

---

## 7. Font size scale used

| Element | Size |
|---|---|
| Hero h1 | `clamp(3.5rem, 9vw, 7rem)` |
| Section h2 | `clamp(2.2rem, 5vw, 4rem)` |
| Process h3 | `clamp(1.8rem, 3.5vw, 2.5rem)` |
| Body / descriptions | `17–19px` |
| Card body text | `15–16px` |
| Spec labels, captions | `13–14px` (was `10–11px`) |
| Monospace readouts | `13–14px` |
| Nav links | `12px` (intentionally compact) |
| Eyebrow labels | `12–13px` (was `10–11px`) |

---

## 8. Quick deployment checklist

- [ ] Copy all `.jsx` files to `src/components/`
- [ ] Copy `App.jsx` to `src/`
- [ ] Add `darkMode: "class"` to `tailwind.config.js`
- [ ] Add `ThemeProvider` to `main.jsx` (or leave the one inside `App.jsx`)
- [ ] Add `.env` with `VITE_WEB3FORMS_KEY=...`
- [ ] Paste meta tags into `public/index.html`
- [ ] Replace `YOUR_SITE_URL` and `YOUR_OG_IMAGE_URL` in meta tags
- [ ] Replace placeholder testimonials in `TestimonialsCarousel.jsx` with real quotes
- [ ] Replace placeholder certifications in `CertificationsBadges.jsx` with real ones
- [ ] Replace facility images in `GalleryLightbox.jsx` with actual photos
