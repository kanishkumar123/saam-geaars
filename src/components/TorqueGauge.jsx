// ─────────────────────────────────────────────
// TorqueGauge.jsx
// Semi-circular SVG dial that fills green → orange → red
// based on a 0–100 percent value.
//
// SLOT IN App.jsx:
//   Used internally by GearRatioCalculator.jsx.
//   Also usable standalone:
//     <TorqueGauge percent={72} label="Output Torque Load" />
// ─────────────────────────────────────────────
import { useEffect, useRef } from "react";

const SIZE = 180;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const CX = SIZE / 2;
const CY = SIZE / 2 + 10; // shift down slightly for half-arc
const START_ANGLE = 210; // degrees (bottom-left)
const END_ANGLE = 330;   // total sweep = 330°
const TOTAL_ARC = 300;   // 300° sweep

// Convert polar to cartesian
function polar(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// Build SVG arc path
function arcPath(cx, cy, r, startDeg, sweepDeg) {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, startDeg + sweepDeg);
  const largeArc = sweepDeg > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

// Interpolate colour green→orange→red
function gaugeColor(pct) {
  if (pct < 50) {
    // green → orange
    const t = pct / 50;
    const r = Math.round(100 + 134 * t);
    const g = Math.round(153 - 73 * t);
    return `rgb(${r},${g},34)`;
  } else {
    // orange → red
    const t = (pct - 50) / 50;
    const r = 234;
    const g = Math.round(80 - 80 * t);
    return `rgb(${r},${g},12)`;
  }
}

const CIRCUMFERENCE = (TOTAL_ARC / 360) * (2 * Math.PI * R);

export default function TorqueGauge({ percent = 0, label = "Load" }) {
  const fillRef = useRef(null);
  const clamped = Math.min(100, Math.max(0, percent));
  const fillLength = (clamped / 100) * CIRCUMFERENCE;
  const dashOffset = CIRCUMFERENCE - fillLength;
  const color = gaugeColor(clamped);

  const trackPath = arcPath(CX, CY, R, START_ANGLE, TOTAL_ARC);

  // Build needle
  const needleAngle = START_ANGLE + (clamped / 100) * TOTAL_ARC;
  const needleTip = polar(CX, CY, R - STROKE / 2 - 4, needleAngle);

  // Tick marks at 0%, 25%, 50%, 75%, 100%
  const ticks = [0, 25, 50, 75, 100].map((p) => {
    const angle = START_ANGLE + (p / 100) * TOTAL_ARC;
    const outer = polar(CX, CY, R + 4, angle);
    const inner = polar(CX, CY, R - STROKE - 4, angle);
    return { outer, inner, p };
  });

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ width: SIZE, height: SIZE * 0.72, overflow: "visible" }}
      >
        {/* Track (background arc) */}
        <path
          d={trackPath}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />

        {/* Fill arc */}
        <path
          ref={fillRef}
          d={trackPath}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.6s ease" }}
        />

        {/* Tick marks */}
        {ticks.map(({ outer, inner, p }) => (
          <line
            key={p}
            x1={inner.x} y1={inner.y}
            x2={outer.x} y2={outer.y}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}

        {/* Needle */}
        <line
          x1={CX} y1={CY}
          x2={needleTip.x} y2={needleTip.y}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          style={{ transition: "all 0.6s ease" }}
        />
        <circle cx={CX} cy={CY} r="5" fill={color} style={{ transition: "fill 0.6s ease" }} />

        {/* Center percent label */}
        <text
          x={CX} y={CY + 24}
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {Math.round(clamped)}%
        </text>
      </svg>

      <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}
