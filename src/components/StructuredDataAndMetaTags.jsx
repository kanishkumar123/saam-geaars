// ─────────────────────────────────────────────
// StructuredData.jsx
// Injects JSON-LD LocalBusiness schema for Google rich results.
//
// SLOT IN App.jsx (or index.html for SSR/Next.js):
//   Add at the very top of the App return, before all other elements:
//     <StructuredData />
//
// For Vite/CRA (client-side only), useEffect ensures it mounts once.
// For Next.js, use next/head or the metadata API instead.
// ─────────────────────────────────────────────
import { useEffect } from "react";

export function StructuredData() {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": "https://www.saamgeaars.com/#business",
      "name": "Saam Geaars",
      "alternateName": "Saam Gears",
      "description": "Precision gear and gearbox manufacturer in Coimbatore, India. Specialists in helical gears, worm gearboxes, sprockets and CNC machined components since 2001.",
      "url": "https://www.saamgeaars.com",
      "telephone": ["+91-98430-18244", "+91-92444-32312", "0422-2632312"],
      "email": ["saamgeaars@gmail.com", "saamgeaars@rediffmail.com"],
      "foundingDate": "2001",
      "vatID": "33AOXPS6790L1ZS",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "86, Thippa Gounder Street, Sivalingapuram",
        "addressLocality": "Ondipudur",
        "addressRegion": "Tamil Nadu",
        "postalCode": "641016",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 11.0168,
        "longitude": 76.9558
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "09:00",
          "closes": "18:30"
        }
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Gear Manufacturing Products",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Precision Spur & Helical Gears", "description": "Module 1–30, OD up to 3000mm, hardened and profile ground" } },
          { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Worm Reduction Gearboxes", "description": "Power range 0.5 to 300 HP, ratios up to 60:1" } },
          { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Industrial Sprockets", "description": "Chain pitch up to 10 inches, OD up to 36 inches, all hub types" } },
          { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Bevel & Helical Gearboxes", "description": "Custom-built to customer specification" } },
          { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "CNC Machined Components", "description": "5-axis CNC machining in 9500 sq ft facility" } }
        ]
      },
      "areaServed": {
        "@type": "State",
        "name": "Tamil Nadu"
      },
      "sameAs": []
    });
    document.head.appendChild(script);
    return () => { if (script.parentNode) script.parentNode.removeChild(script); };
  }, []);

  return null;
}


// ─────────────────────────────────────────────
// MetaTags — paste into your index.html <head>
// (For Vite/CRA, edit public/index.html)
// (For Next.js, use the metadata export in layout.tsx)
// ─────────────────────────────────────────────
//
// Replace YOUR_SITE_URL with your domain (e.g. https://www.saamgeaars.com)
// Replace YOUR_OG_IMAGE_URL with a 1200×630px image of the gear/facility
//
// Paste this entire block inside <head> in public/index.html:
//
// <!-- Primary Meta -->
// <title>Saam Geaars — Precision Gear & Gearbox Manufacturer, Coimbatore</title>
// <meta name="description" content="Saam Geaars manufactures precision gears, worm gearboxes, helical gearboxes and industrial sprockets in Coimbatore, India. Est. 2001. CNC machined to IS/ISO/AGMA standards. Call +91 98430 18244." />
// <meta name="keywords" content="gear manufacturer coimbatore, gearbox manufacturer india, precision gears, helical gears, worm gearbox, sprockets, CNC machining coimbatore, industrial gears tamil nadu" />
// <meta name="author" content="Saam Geaars" />
// <meta name="robots" content="index, follow" />
// <link rel="canonical" href="YOUR_SITE_URL" />
//
// <!-- Open Graph (Facebook, LinkedIn, WhatsApp) -->
// <meta property="og:type" content="website" />
// <meta property="og:url" content="YOUR_SITE_URL" />
// <meta property="og:title" content="Saam Geaars — Precision Gear & Gearbox Manufacturer, Coimbatore" />
// <meta property="og:description" content="Over two decades of precision gear manufacturing. Helical gears, worm gearboxes, sprockets. Module up to 30, OD up to 3m. Call +91 98430 18244." />
// <meta property="og:image" content="YOUR_OG_IMAGE_URL" />
// <meta property="og:image:width" content="1200" />
// <meta property="og:image:height" content="630" />
// <meta property="og:image:alt" content="Saam Geaars precision gearbox manufacturing facility, Coimbatore" />
// <meta property="og:locale" content="en_IN" />
// <meta property="og:site_name" content="Saam Geaars" />
//
// <!-- Twitter Card -->
// <meta name="twitter:card" content="summary_large_image" />
// <meta name="twitter:title" content="Saam Geaars — Precision Gear & Gearbox Manufacturer" />
// <meta name="twitter:description" content="Precision gears, worm gearboxes, sprockets. Est. 2001, Coimbatore." />
// <meta name="twitter:image" content="YOUR_OG_IMAGE_URL" />
//
// <!-- Geo tags (local SEO) -->
// <meta name="geo.region" content="IN-TN" />
// <meta name="geo.placename" content="Coimbatore" />
// <meta name="geo.position" content="11.0168;76.9558" />
// <meta name="ICBM" content="11.0168, 76.9558" />
//
// ─────────────────────────────────────────────
// MetaTags React component (for react-helmet-async)
// Install: npm install react-helmet-async
// Wrap your App in <HelmetProvider> first.
// ─────────────────────────────────────────────
export function MetaTags() {
  // Using react-helmet-async — install if not already present
  // import { Helmet } from "react-helmet-async";
  // Then uncomment the JSX below:
  /*
  return (
    <Helmet>
      <title>Saam Geaars — Precision Gear & Gearbox Manufacturer, Coimbatore</title>
      <meta name="description" content="Saam Geaars manufactures precision gears, worm gearboxes and industrial sprockets in Coimbatore. Est. 2001. IS/ISO/AGMA standards. +91 98430 18244." />
      <meta property="og:title" content="Saam Geaars — Precision Gear & Gearbox Manufacturer, Coimbatore" />
      <meta property="og:description" content="Over 20 years of precision gear manufacturing. Module up to 30, OD up to 3m. Call us." />
      <meta property="og:image" content="YOUR_OG_IMAGE_URL" />
      <meta property="og:type" content="website" />
      <meta name="geo.region" content="IN-TN" />
    </Helmet>
  );
  */
  return null; // Remove this line when using Helmet above
}

export default StructuredData;
