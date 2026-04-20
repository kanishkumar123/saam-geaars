/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        industrial: {
          900: "#111827",
          800: "#1f2937",
          accent: "#f97316", // A safety orange for contrast
        },
      },
    },
  },
  plugins: [],
};
