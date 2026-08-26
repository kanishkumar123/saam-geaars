// All art is drawn procedurally with canvas rects — no image assets, no
// original game sprites. Each function draws one thing at a given
// top-left pixel position and is intentionally simple pixel-block art.
import { TileKind, Direction, TankKind, PowerupKind, HALF_TILE_PX, TILE_PX } from "../engine/types";

const BRICK = "#b5502e";
const BRICK_DARK = "#8a3a1f";
const STEEL = "#9aa5ad";
const STEEL_LIGHT = "#c7d0d6";
const WATER_A = "#2f6fd6";
const WATER_B = "#4a8ce8";
const ICE = "#cfeeff";
const TREE_DARK = "#1f5c2e";
const TREE_LIGHT = "#2f7a41";

export function drawCellTerrain(ctx: CanvasRenderingContext2D, kind: TileKind, x: number, y: number) {
  const s = HALF_TILE_PX;
  switch (kind) {
    case "brick":
      ctx.fillStyle = BRICK;
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = BRICK_DARK;
      ctx.fillRect(x, y + s / 2 - 1, s, 2);
      ctx.fillRect(x + s / 2 - 1, y, 2, s / 2);
      ctx.fillRect(x, y + s / 2, 2, s / 2);
      break;
    case "steel":
      ctx.fillStyle = STEEL;
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = STEEL_LIGHT;
      ctx.fillRect(x + 1, y + 1, s - 2, 2);
      ctx.fillRect(x + 1, y + 1, 2, s - 2);
      break;
    case "water":
      ctx.fillStyle = WATER_A;
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = WATER_B;
      ctx.fillRect(x, y + s * 0.3, s, 2);
      ctx.fillRect(x, y + s * 0.7, s, 2);
      break;
    case "ice":
      ctx.fillStyle = ICE;
      ctx.fillRect(x, y, s, s);
      break;
    case "base":
      // Drawn by drawBase() as one full tile, not per half-cell.
      break;
    default:
      // empty / trees (trees drawn separately, above tanks)
      break;
  }
}

export function drawTreeCell(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const s = HALF_TILE_PX;
  ctx.fillStyle = TREE_DARK;
  ctx.fillRect(x, y, s, s);
  ctx.fillStyle = TREE_LIGHT;
  ctx.fillRect(x + 2, y + 2, s - 6, s - 6);
}

// The base is one visual unit spanning the 2x2 cell block its "base" cells
// occupy — drawn once per tile rather than per half-cell.
export function drawBase(ctx: CanvasRenderingContext2D, x: number, y: number, alive: boolean) {
  ctx.fillStyle = alive ? "#3a4a3a" : "#5c1414";
  ctx.fillRect(x, y, TILE_PX, TILE_PX);
  ctx.fillStyle = alive ? "#e8c84a" : "#902626";
  // Simple eagle-silhouette-ish diamond, procedural, no traced artwork.
  ctx.beginPath();
  ctx.moveTo(x + TILE_PX / 2, y + 4);
  ctx.lineTo(x + TILE_PX - 6, y + TILE_PX / 2);
  ctx.lineTo(x + TILE_PX / 2, y + TILE_PX - 4);
  ctx.lineTo(x + 6, y + TILE_PX / 2);
  ctx.closePath();
  ctx.fill();
}

// One color pair per upgrade level, so the tank visibly changes with
// each Star pickup (and visibly resets to L0 on death).
const PLAYER_COLORS_BY_LEVEL: readonly [string, string][] = [
  ["#f4d33c", "#c9a416"], // L0
  ["#f4a33c", "#c97a16"], // L1
  ["#f46b3c", "#c94a16"], // L2
  ["#f4f4f4", "#a0a0a0"], // L3 — bright chrome, the fully-upgraded look
];

export function drawTank(ctx: CanvasRenderingContext2D, x: number, y: number, dir: Direction, size: number, body: string, dark: string, invulnerable: boolean) {
  ctx.save();
  if (invulnerable) ctx.globalAlpha = 0.55 + 0.35 * Math.sin(Date.now() / 60);

  ctx.fillStyle = dark;
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = body;
  ctx.fillRect(x + 2, y + 2, size - 4, size - 4);

  // Tread marks on the two sides perpendicular to travel.
  ctx.fillStyle = dark;
  if (dir === "up" || dir === "down") {
    ctx.fillRect(x, y + 2, 3, size - 4);
    ctx.fillRect(x + size - 3, y + 2, 3, size - 4);
  } else {
    ctx.fillRect(x + 2, y, size - 4, 3);
    ctx.fillRect(x + 2, y + size - 3, size - 4, 3);
  }

  // Barrel, pointing in the facing direction.
  ctx.fillStyle = dark;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const barrelLen = size / 2 + 4;
  const barrelW = 4;
  if (dir === "up") ctx.fillRect(cx - barrelW / 2, cy - barrelLen, barrelW, barrelLen);
  else if (dir === "down") ctx.fillRect(cx - barrelW / 2, cy, barrelW, barrelLen);
  else if (dir === "left") ctx.fillRect(cx - barrelLen, cy - barrelW / 2, barrelLen, barrelW);
  else ctx.fillRect(cx, cy - barrelW / 2, barrelLen, barrelW);

  ctx.restore();
}

export function drawPlayerTank(ctx: CanvasRenderingContext2D, x: number, y: number, dir: Direction, size: number, level: number, invulnerable: boolean) {
  const [body, dark] = PLAYER_COLORS_BY_LEVEL[Math.min(level, PLAYER_COLORS_BY_LEVEL.length - 1)];
  drawTank(ctx, x, y, dir, size, body, dark, invulnerable);
}

// A pulsing dashed ring — the Helmet shield.
export function drawShield(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.strokeStyle = "#7fd6ff";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.lineDashOffset = -(Date.now() / 40) % 14;
  ctx.strokeRect(x - 3, y - 3, size + 6, size + 6);
  ctx.restore();
}

const ENEMY_COLORS: Record<Exclude<TankKind, "player" | "armor">, [string, string]> = {
  basic: ["#c9c9c9", "#8f8f8f"],
  fast: ["#5fd6e0", "#2f9aa3"],
  power: ["#e07be0", "#a53fa5"],
};

// Armor tanks recolor with each hit taken (4 HP down to 1) instead of
// having one fixed color — the color itself is the enemy's healthbar.
const ARMOR_COLORS_BY_HP: Record<number, [string, string]> = {
  4: ["#7bd67b", "#4a9a4a"],
  3: ["#e0d65f", "#a89a2f"],
  2: ["#b5b5b5", "#7a7a7a"],
  1: ["#e06b6b", "#a53f3f"],
};

export function drawEnemyTank(ctx: CanvasRenderingContext2D, x: number, y: number, dir: Direction, size: number, kind: TankKind, hp: number, invulnerable: boolean) {
  const [body, dark] = kind === "armor" ? (ARMOR_COLORS_BY_HP[hp] ?? ARMOR_COLORS_BY_HP[1]) : ENEMY_COLORS[kind as Exclude<TankKind, "player" | "armor">];
  drawTank(ctx, x, y, dir, size, body, dark, invulnerable);
}

export function drawBullet(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, isPlayer: boolean) {
  ctx.fillStyle = isPlayer ? "#fff6c9" : "#ffb0b0";
  ctx.fillRect(x, y, size, size);
}

// A flashing warning square at a spawn point, before the tank appears.
export function drawSpawnFlash(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, ticksLeft: number) {
  if (Math.floor(ticksLeft / 4) % 2 === 0) return; // blink
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 3, y + 3, size - 6, size - 6);
}

const POWERUP_BG = "#1a1a1a";
const POWERUP_ICON_COLORS: Record<PowerupKind, string> = {
  helmet: "#7fd6ff",
  star: "#ffe066",
  grenade: "#8a8a8a",
  tank: "#8fd68f",
  shovel: "#c98a4a",
  timer: "#e08fe0",
};

// A boxed glyph per power-up kind — simple enough to read at 32px, no
// icon font or traced artwork.
export function drawPowerupIcon(ctx: CanvasRenderingContext2D, kind: PowerupKind, x: number, y: number, size: number, warn: boolean) {
  if (warn && Math.floor(Date.now() / 120) % 2 === 0) return; // blink during despawn warning

  ctx.fillStyle = POWERUP_BG;
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = POWERUP_ICON_COLORS[kind];
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);

  const cx = x + size / 2;
  const cy = y + size / 2;
  ctx.fillStyle = POWERUP_ICON_COLORS[kind];
  ctx.strokeStyle = POWERUP_ICON_COLORS[kind];

  switch (kind) {
    case "helmet":
      ctx.beginPath();
      ctx.arc(cx, cy + 2, size * 0.28, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(cx - size * 0.28, cy + 2, size * 0.56, 3);
      break;
    case "star": {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        const innerAngle = angle + Math.PI / 5;
        const outer = size * 0.32;
        const inner = size * 0.14;
        const ox = cx + Math.cos(angle) * outer;
        const oy = cy + Math.sin(angle) * outer;
        const ix = cx + Math.cos(innerAngle) * inner;
        const iy = cy + Math.sin(innerAngle) * inner;
        if (i === 0) ctx.moveTo(ox, oy);
        else ctx.lineTo(ox, oy);
        ctx.lineTo(ix, iy);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "grenade":
      ctx.beginPath();
      ctx.arc(cx, cy + 2, size * 0.24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - 2, cy - size * 0.32, 4, size * 0.18);
      break;
    case "tank":
      ctx.fillRect(cx - size * 0.26, cy - size * 0.16, size * 0.52, size * 0.32);
      ctx.fillRect(cx - 2, cy - size * 0.28, 4, size * 0.14);
      break;
    case "shovel":
      ctx.fillRect(cx - 3, cy - size * 0.28, 6, size * 0.34);
      ctx.beginPath();
      ctx.moveTo(cx - size * 0.22, cy + size * 0.06);
      ctx.lineTo(cx + size * 0.22, cy + size * 0.06);
      ctx.lineTo(cx, cy + size * 0.32);
      ctx.closePath();
      ctx.fill();
      break;
    case "timer":
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy - size * 0.2);
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + size * 0.14, cy);
      ctx.stroke();
      break;
  }
}

export function drawExplosion(ctx: CanvasRenderingContext2D, cx: number, cy: number, progress: number, large: boolean) {
  // progress: 0 (just started) -> 1 (finished). A few expanding, fading
  // pixel rings rather than a traced sprite sheet.
  const maxRadius = (large ? 26 : 16) * (0.4 + progress * 0.6);
  const alpha = 1 - progress;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = progress < 0.5 ? "#fff2a8" : "#ff8a3d";
  ctx.beginPath();
  ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
