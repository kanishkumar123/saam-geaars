// ─────────────────────────────────────────────
// ProductSpecTable.jsx
// Replaces the static product bullet lists with
// a tabbed animated specification table.
//
// SLOT IN App.jsx:
//   In the #products section, replace the 3-column card grid with:
//     <ProductSpecTable />
// ─────────────────────────────────────────────
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TABS = ["Precision Gears", "Gear Box Units", "Sprockets"];

const DATA = {
  "Precision Gears": {
    tagline: "Module up to 30 · Size up to 3m diameter",
    specs: [
      {
        param: "Types Available",
        value: "Spur, Helical, Worm & Wheel, Bevel, Rack & Pinion, Girth Gear",
      },
      { param: "Module Range", value: "1 to 30" },
      { param: "Maximum OD", value: "Up to 3000 mm" },
      {
        param: "Material Options",
        value: "EN8, EN36, EN353, Cast Iron, SS, Bronze",
      },
      {
        param: "Heat Treatment",
        value: "Carburizing, Case Hardening, Induction Hardening",
      },
      {
        param: "Surface Finish",
        value: "Hobbed, Shaved, Hardened & Profile Ground",
      },
      { param: "Tooth Profile", value: "AGMA / IS / ISO / DIN Standards" },
      { param: "Accuracy Grade", value: "IS 3675 Grade 6–12" },
      { param: "Tolerance", value: "±0.001 mm (profile ground)" },
      { param: "Quantity", value: "Single piece to batch production" },
    ],
  },
  "Gear Box Units": {
    tagline: "Power range up to 300 HP",
    specs: [
      {
        param: "Types Available",
        value: "Worm Reduction, Helical, Bevel-Helical, Geared Motor, Internal",
      },
      { param: "Power Range", value: "0.5 HP to 300 HP" },
      {
        param: "Reduction Ratio",
        value: "1:5 to 1:60 (single stage), higher on request",
      },
      { param: "Input Speed", value: "Up to 3000 RPM" },
      { param: "Mounting", value: "Foot, Flange, Hollow Shaft, Torque Arm" },
      {
        param: "Output Shaft",
        value: "Solid / Hollow, with or without keyway",
      },
      { param: "Housing Material", value: "Cast Iron, Fabricated Steel" },
      { param: "Lubrication", value: "Oil Splash / Forced Lubrication" },
      { param: "Sealing", value: "Oil Seals on All Shafts" },
      {
        param: "Spares Available",
        value: "Input/Output Shafts, Worm Shafts, Wheels, Bearings",
      },
    ],
  },
  Sprockets: {
    tagline: 'Pitch up to 10" · OD up to 36"',
    specs: [
      {
        param: "Types Available",
        value:
          "Standard Roller Chain, Conveyor (Forged Link), Traction Wheel (Segmental)",
      },
      {
        param: "Chain Pitch Range",
        value: '3/8" to 10" (IS / ANSI / ASME / ISO)',
      },
      { param: "Maximum OD", value: "Up to 36 inches" },
      {
        param: "Hub Types",
        value: "Type A (Flat), B (Single Hub), C (Double Hub), D (Split)",
      },
      { param: "Strand", value: "Simplex / Duplex / Triplex" },
      { param: "Number of Teeth", value: "6 to 120 (custom on request)" },
      { param: "Bore Range", value: "12 mm to 300 mm" },
      { param: "Material", value: "EN8, EN19, Cast Iron, MS Fabricated" },
      {
        param: "Surface Treatment",
        value: "Hardening, Black Oxide, Zinc Plating (optional)",
      },
      {
        param: "Keyway & Set Screws",
        value: "Standard or to customer drawing",
      },
    ],
  },
};

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

export default function ProductSpecTable() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);

  const switchTab = (i) => {
    setDir(i > active ? 1 : -1);
    setActive(i);
  };

  const { tagline, specs } = DATA[TABS[active]];

  return (
    <div className="w-full">
      {/* Tab buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => switchTab(i)}
            className={`relative flex-1 py-3 px-4 text-xs font-bold uppercase tracking-widest rounded-lg border transition-colors ${
              active === i
                ? "border-cyan-500 text-cyan-500 bg-cyan-500/10"
                : "border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200"
            }`}
          >
            {tab}
            {active === i && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-4 right-4 h-[2px] bg-cyan-500 rounded"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tagline */}
      <p className="text-cyan-500 font-mono text-sm mb-4 tracking-wider">
        {tagline}
      </p>

      {/* Animated spec table */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.table
            key={active}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <tbody>
              {specs.map((row, i) => (
                <motion.tr
                  key={row.param}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}
                >
                  <td className="py-3 pl-5 pr-3 text-[11px] text-gray-500 uppercase tracking-widest font-medium w-2/5">
                    {row.param}
                  </td>
                  <td className="py-3 pr-5 text-sm text-gray-200 font-mono">
                    {row.value}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        </AnimatePresence>
      </div>
    </div>
  );
}
