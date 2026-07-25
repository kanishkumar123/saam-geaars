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
      name: "Saam Geaars",
      alternateName: "Saam Gears",
      description:
        "Precision gear and gearbox manufacturer in Coimbatore, India. Specialists in helical gears, worm gearboxes, sprockets and CNC machined components since 2001.",
      url: "https://www.saamgeaars.com",
      // TODO: replace with a real photo of the factory/product (not the logo)
      image: "https://www.saamgeaars.com/facility-photo.jpg",
      logo: "https://www.saamgeaars.com/saam-geaars.png",
      priceRange: "On Request",
      telephone: ["+91-98430-18244", "+91-94887-59678"],
      email: ["saamgeaars@gmail.com", "saamgeaars@rediffmail.com"],
      foundingDate: "2001",
      vatID: "33AOXPS6790L1ZS",
      address: {
        "@type": "PostalAddress",
        streetAddress: "16/1, Thiyagi Sengaliyappan Nagar, Irugur",
        addressLocality: "Coimbatore",
        addressRegion: "Tamil Nadu",
        postalCode: "641103",
        addressCountry: "IN",
      },
      // TODO: update to the actual lat/long for the Irugur address
      // (current coordinates were for the old Ondipudur address — get the
      // correct pin via Google Maps: right-click the exact spot > click the coordinates)
      geo: {
        "@type": "GeoCoordinates",
        latitude: 11.0168,
        longitude: 76.9558,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
          opens: "09:00",
          closes: "18:30",
        },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Gear Manufacturing Products",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Product",
              name: "Precision Spur & Helical Gears",
              description:
                "Module 1–30, OD up to 3000mm, hardened and profile ground",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Product",
              name: "Worm Reduction Gearboxes",
              description: "Power range 0.5 to 300 HP, ratios up to 60:1",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Product",
              name: "Industrial Sprockets",
              description:
                "Chain pitch up to 10 inches, OD up to 36 inches, all hub types",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Product",
              name: "Bevel & Helical Gearboxes",
              description: "Custom-built to customer specification",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Product",
              name: "CNC Machined Components",
              description: "CNC machining in facility",
            },
          },
        ],
      },
      areaServed: {
        "@type": "State",
        name: "Tamil Nadu",
      },
      // TODO: the JustDial listing below is registered under the OLD
      // Sivalingapuram/Ondipudur address, which now conflicts with this
      // page. Update that listing to the Irugur address (or remove this
      // link until it's fixed) to avoid an external NAP mismatch.
      sameAs: [
        "https://www.indiamart.com/saam-geaars/",
        "https://www.justdial.com/Coimbatore/Saam-Gears-Sivalingapuram-Ondipudur-Ondipudur/0422PX422-X422-101204122526-C6N1_BZDET",
      ],
    });
    document.head.appendChild(script);
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return null;
}

export default StructuredData;
