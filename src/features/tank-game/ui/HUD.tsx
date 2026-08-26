// Right-rail HUD: remaining-enemy icons, lives, stage flag. Pure display —
// every number here is read straight off GameState by the caller each
// frame, nothing is derived into new engine state.
const ICON = { width: 14, height: 14 };

function EnemyIcon() {
  return (
    <div
      style={{
        width: ICON.width,
        height: ICON.height,
        background: "#c9c9c9",
        border: "1px solid #8f8f8f",
        boxSizing: "border-box",
      }}
    />
  );
}

function LifeIcon() {
  return (
    <div
      style={{
        width: ICON.width,
        height: ICON.height,
        background: "#f4d33c",
        border: "1px solid #c9a416",
        boxSizing: "border-box",
      }}
    />
  );
}

function StageFlag({ stageNumber }: { stageNumber: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
        <line x1="2" y1="1" x2="2" y2="15" stroke="#e8e8e8" strokeWidth="1.5" />
        <path d="M2 2 L14 4 L2 8 Z" fill="#e0645b" />
      </svg>
      <span style={{ fontSize: "13px", fontWeight: 700, color: "#e8e8e8" }}>{stageNumber}</span>
    </div>
  );
}

export interface HUDProps {
  remainingEnemies: number;
  lives: number;
  stageNumber: number; // 1-indexed for display
  score: number;
}

export default function HUD({ remainingEnemies, lives, stageNumber, score }: HUDProps) {
  return (
    <div
      style={{
        width: "90px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        padding: "8px 6px",
        fontFamily: "ui-monospace, 'SF Mono', Consolas, monospace",
        color: "#e8e8e8",
      }}
    >
      <StageFlag stageNumber={stageNumber} />

      <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.04em" }}>{score}</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "3px" }}>
        {Array.from({ length: remainingEnemies }, (_, i) => (
          <EnemyIcon key={i} />
        ))}
      </div>

      <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
        {Array.from({ length: Math.max(lives, 0) }, (_, i) => (
          <LifeIcon key={i} />
        ))}
      </div>
    </div>
  );
}
