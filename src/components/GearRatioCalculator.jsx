import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, Settings } from "lucide-react";
import TorqueGauge from "./TorqueGauge";

const EFFICIENCY = {
  spur: 0.98,
  helical: 0.97,
  worm: 0.85,
  bevel: 0.97,
};

export default function GearRatioCalculator() {
  const [t1, setT1] = useState(20); // driver teeth
  const [t2, setT2] = useState(40); // driven teeth
  const [rpm1, setRpm1] = useState(1440);
  const [torque1, setTorque1] = useState(50); // Nm
  const [gearType, setGearType] = useState("helical");

  const calc = useMemo(() => {
    const ratio = t2 / t1;
    const eff = EFFICIENCY[gearType];
    const rpm2 = rpm1 / ratio;
    const torque2 = torque1 * ratio * eff;
    const maxTorque = 2000;
    const gaugePercent = Math.min((torque2 / maxTorque) * 100, 100);
    return {
      ratio: ratio.toFixed(2),
      rpm2: rpm2.toFixed(0),
      torque2: torque2.toFixed(1),
      eff: (eff * 100).toFixed(0),
      gaugePercent,
    };
  }, [t1, t2, rpm1, torque1, gearType]);

  const inputClass =
    "w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors";
  const labelClass =
    "block text-[10px] text-gray-500 uppercase tracking-widest mb-1";
  const valClass = "font-mono text-white text-lg font-bold";
  const unitClass = "text-gray-500 text-xs ml-1";

  return (
    <div className="bg-[#0a0a0a]/80 border border-white/10 backdrop-blur-md p-6 rounded-xl w-full max-w-md shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-4">
        <Calculator className="text-cyan-500 w-5 h-5" />
        <h3 className="text-sm font-bold uppercase tracking-widest">
          Gear Ratio Calculator
        </h3>
      </div>

      {/* Gear type selector */}
      <div className="mb-5">
        <p className={labelClass}>Gear Type</p>
        <div className="grid grid-cols-4 gap-1">
          {Object.keys(EFFICIENCY).map((type) => (
            <button
              key={type}
              onClick={() => setGearType(type)}
              className={`text-[10px] uppercase tracking-wider py-1.5 rounded border transition-colors capitalize ${
                gearType === type
                  ? "border-cyan-500 bg-cyan-500/10 text-cyan-500"
                  : "border-white/10 text-gray-500 hover:border-white/20"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className={labelClass}>Driver Teeth (T₁)</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="8"
              max="100"
              value={t1}
              onChange={(e) => setT1(+e.target.value)}
              className="flex-1 accent-cyan-500"
            />
            <span className="text-white font-mono text-sm w-8 text-right">
              {t1}
            </span>
          </div>
        </div>
        <div>
          <label className={labelClass}>Driven Teeth (T₂)</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="8"
              max="100"
              value={t2}
              onChange={(e) => setT2(+e.target.value)}
              className="flex-1 accent-cyan-500"
            />
            <span className="text-white font-mono text-sm w-8 text-right">
              {t2}
            </span>
          </div>
        </div>
        <div>
          <label className={labelClass}>Input Speed (RPM)</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="10"
              max="3000"
              value={rpm1}
              onChange={(e) => setRpm1(+e.target.value)}
              className="flex-1 accent-cyan-500"
            />
            <span className="text-white font-mono text-sm w-12 text-right">
              {rpm1}
            </span>
          </div>
        </div>
        <div>
          <label className={labelClass}>Input Torque (Nm)</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="500"
              value={torque1}
              onChange={(e) => setTorque1(+e.target.value)}
              className="flex-1 accent-cyan-500"
            />
            <span className="text-white font-mono text-sm w-10 text-right">
              {torque1}
            </span>
          </div>
        </div>
      </div>

      {/* Gauge */}
      <TorqueGauge
        percent={parseFloat(calc.gaugePercent)}
        label="Output Torque Load"
      />

      {/* Results */}
      <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <p className={labelClass}>Gear Ratio</p>
          <p className={valClass}>
            {calc.ratio}
            <span className={unitClass}>:1</span>
          </p>
        </div>
        <div>
          <p className={labelClass}>Output Speed</p>
          <p className={valClass}>
            {calc.rpm2}
            <span className={unitClass}>RPM</span>
          </p>
        </div>
        <div>
          <p className={labelClass}>Output Torque</p>
          <p className="font-mono text-cyan-500 text-xl font-bold">
            {calc.torque2}
            <span className={unitClass}>Nm</span>
          </p>
        </div>
        <div>
          <p className={labelClass}>Efficiency</p>
          <p className={valClass}>
            {calc.eff}
            <span className={unitClass}>%</span>
          </p>
        </div>
      </div>
    </div>
  );
}
