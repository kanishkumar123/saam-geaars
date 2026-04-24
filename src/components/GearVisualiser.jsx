// ─────────────────────────────────────────────
// GearVisualiser.jsx
// Two SVG gears spinning at the mathematically correct speed ratio.
// Driver and driven teeth are adjustable with sliders.
//
// SLOT IN App.jsx:
//   Add inside or after the #products section:
//     <GearVisualiser />
// ─────────────────────────────────────────────
import { useState, useMemo } from "react";

// Generates an SVG path string for a gear shape
function gearPath(cx, cy, teeth, outerR, innerR, holeR) {
  const pts = teeth * 4;
  const step = (Math.PI * 2) / pts;
  let d = "";
  for (let i = 0; i < pts; i++) {
    const isOuter = i % 4 === 1 || i % 4 === 2;
    const r = isOuter ? outerR : innerR;
    const a = i * step - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    d += (i === 0 ? "M" : "L") + `${x.toFixed(2)},${y.toFixed(2)} `;
  }
  d += "Z";
  // centre hole (counter-clockwise so SVG fills correctly)
  const holeSteps = 40;
  const hs = (Math.PI * 2) / holeSteps;
  d += ` M${(cx + holeR).toFixed(2)},${cy.toFixed(2)}`;
  for (let i = holeSteps; i >= 0; i--) {
    const a = i * hs;
    d += ` L${(cx + Math.cos(a) * holeR).toFixed(2)},${(cy + Math.sin(a) * holeR).toFixed(2)}`;
  }
  d += " Z";
  return d;
}

export default function GearVisualiser() {
  const [t1, setT1] = useState(20); // driver teeth
  const [t2, setT2] = useState(10); // driven teeth
  const [rpm, setRpm] = useState(60); // driver base RPM

  const config = useMemo(() => {
    const ratio = t2 / t1;
    const rpm2 = rpm / ratio;
    // Scale radii to tooth count so they look proportional
    const r1Outer = Math.max(28, t1 * 2.5);
    const r1Inner = r1Outer - 8;
    const r1Hole = r1Outer * 0.2;
    const r2Outer = Math.max(18, t2 * 2.5);
    const r2Inner = r2Outer - 6;
    const r2Hole = r2Outer * 0.2;
    // Center coords — gears should be meshed (distance = sum of pitch radii)
    // pitch radius ≈ (outer + inner) / 2
    const pr1 = (r1Outer + r1Inner) / 2;
    const pr2 = (r2Outer + r2Inner) / 2;
    const cx1 = 120;
    const cy1 = 130;
    const cx2 = cx1 + pr1 + pr2;
    const cy2 = cy1;
    // Animation durations — driver: 60/rpm seconds per rev
    const d1 = (60 / rpm).toFixed(3);
    const d2 = (60 / rpm2).toFixed(3);
    const svgWidth = cx2 + r2Outer + 20;
    return {
      r1Outer,
      r1Inner,
      r1Hole,
      r2Outer,
      r2Inner,
      r2Hole,
      cx1,
      cy1,
      cx2,
      cy2,
      d1,
      d2,
      svgWidth,
      ratio: ratio.toFixed(2),
      rpm2: rpm2.toFixed(0),
    };
  }, [t1, t2, rpm]);

  const path1 = useMemo(
    () => gearPath(0, 0, t1, config.r1Outer, config.r1Inner, config.r1Hole),
    [t1, config],
  );
  const path2 = useMemo(
    () => gearPath(0, 0, t2, config.r2Outer, config.r2Inner, config.r2Hole),
    [t2, config],
  );

  return (
    <div className="bg-[#0a0a0a]/80 border border-white/10 rounded-xl p-6 w-full">
      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-5">
        Gear Ratio Visualiser
      </p>

      {/* SVG canvas */}
      <div className="overflow-x-auto mb-6">
        <svg
          viewBox={`0 0 ${config.svgWidth} 260`}
          style={{
            width: "100%",
            minWidth: "280px",
            maxWidth: "500px",
            height: "auto",
            display: "block",
            margin: "0 auto",
          }}
        >
          <defs>
            <style>{`
              @keyframes spin-cw  { to { transform: rotate(360deg); } }
              @keyframes spin-ccw { to { transform: rotate(-360deg); } }
            `}</style>
          </defs>

          {/* Mesh indicator line */}
          <line
            x1={config.cx1}
            y1={config.cy1}
            x2={config.cx2}
            y2={config.cy2}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Driver gear */}
          <g
            transform={`translate(${config.cx1},${config.cy1})`}
            style={{
              animation: `spin-cw ${config.d1}s linear infinite`,
              transformOrigin: "0 0",
            }}
          >
            <path d={path1} fill="#8c9196" fillRule="evenodd" opacity="0.9" />
          </g>
          <text
            x={config.cx1}
            y={config.cy1 + config.r1Outer + 18}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="11"
            fontFamily="monospace"
          >
            {t1}T · {rpm} RPM
          </text>
          <text
            x={config.cx1}
            y={config.cy1 + config.r1Outer + 32}
            textAnchor="middle"
            fill="#6b7280"
            fontSize="9"
            fontFamily="monospace"
          >
            DRIVER
          </text>

          {/* Driven gear — spins opposite direction */}
          <g
            transform={`translate(${config.cx2},${config.cy2})`}
            style={{
              animation: `spin-ccw ${config.d2}s linear infinite`,
              transformOrigin: "0 0",
            }}
          >
            <path d={path2} fill="#ea580c" fillRule="evenodd" opacity="0.8" />
          </g>
          <text
            x={config.cx2}
            y={config.cy2 + config.r2Outer + 18}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="11"
            fontFamily="monospace"
          >
            {t2}T · {config.rpm2} RPM
          </text>
          <text
            x={config.cx2}
            y={config.cy2 + config.r2Outer + 32}
            textAnchor="middle"
            fill="#6b7280"
            fontSize="9"
            fontFamily="monospace"
          >
            DRIVEN
          </text>
        </svg>
      </div>

      {/* Ratio readout */}
      <div className="flex gap-6 mb-6 justify-center">
        <div className="text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">
            Gear Ratio
          </p>
          <p className="text-2xl font-black text-cyan-500 font-mono">
            {config.ratio}
            <span className="text-sm text-gray-400">:1</span>
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">
            Speed Change
          </p>
          <p className="text-2xl font-black text-white font-mono">
            {parseFloat(config.ratio) < 1
              ? "↑"
              : parseFloat(config.ratio) > 1
                ? "↓"
                : "="}
            {Math.abs(parseFloat(config.ratio) - 1) < 0.01
              ? " 1:1"
              : ` ×${(1 / parseFloat(config.ratio)).toFixed(2)}`}
          </p>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Driver Teeth", val: t1, set: setT1, min: 8, max: 80 },
          { label: "Driven Teeth", val: t2, set: setT2, min: 8, max: 80 },
          { label: "Driver RPM", val: rpm, set: setRpm, min: 10, max: 300 },
        ].map(({ label, val, set, min, max }) => (
          <div key={label}>
            <div className="flex justify-between text-[10px] text-gray-500 mb-1 uppercase tracking-wider">
              <span>{label}</span>
              <span className="font-mono text-gray-300">{val}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={val}
              onChange={(e) => set(+e.target.value)}
              className="w-full accent-cyan-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
