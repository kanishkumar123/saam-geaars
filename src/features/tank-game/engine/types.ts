// Core data model. Positions are in PIXELS (not tiles) so movement and
// collision can work at fine (16px half-tile) precision. Grid coordinates
// (row/col into the Cell[][] map) are only used inside map.ts/collision.ts.

export const TILE_PX = 32;
export const HALF_TILE_PX = 16;
export const GRID_TILES = 13;
export const GRID_COLS = GRID_TILES * 2; // 26 half-tile columns
export const GRID_ROWS = GRID_TILES * 2; // 26 half-tile rows
export const CANVAS_PX = GRID_TILES * TILE_PX; // 416

export const TICK_HZ = 60;
export const TICK_MS = 1000 / TICK_HZ;

export type TileKind = "empty" | "brick" | "steel" | "water" | "trees" | "ice" | "base";

export interface Cell {
  kind: TileKind;
}

export type Direction = "up" | "down" | "left" | "right";

export type TankKind = "player" | "basic" | "fast" | "power" | "armor";

export interface Vec2 {
  x: number;
  y: number;
}

export interface Tank {
  id: string;
  kind: TankKind;
  pos: Vec2; // top-left corner, pixels
  dir: Direction;
  speed: number; // px/tick
  hp: number;
  maxHp: number;
  level: number; // player upgrade level 0-3; unused (0) for enemies
  cooldownTicks: number; // ticks until this tank may fire again
  shieldTicks: number; // player Helmet power-up remaining ticks
  spawnInvulnTicks: number; // brief post-spawn invulnerability
  flashing: boolean; // enemy: killing it drops a power-up
  alive: boolean;
  slideDir: Direction | null; // ice momentum: direction still being carried
  slideTicks: number; // ice momentum: ticks of carry-over remaining
  // enemy AI scratch state (unused for player)
  aiTimer: number; // ticks until this enemy is forced to re-decide its direction
  aiReason: AIReason | null; // why the last direction decision was made — debug overlay only
}

export type AIReason = "blocked" | "timer" | "random" | "spawn";

export interface Bullet {
  id: string;
  ownerId: string;
  ownerKind: TankKind;
  pos: Vec2;
  dir: Direction;
  speed: number; // px/tick
  pierceSteel: boolean;
}

// A spawn point that's flashing a warning before the tank actually
// appears — kept separate from `enemies` so it can't be shot/collided
// with while it's still just an animation.
export interface PendingSpawn {
  id: string;
  pos: Vec2;
  kind: TankKind;
  flashing: boolean; // drops a power-up when killed
  ticksLeft: number;
  totalTicks: number;
}

export type PowerupKind = "helmet" | "star" | "grenade" | "tank" | "shovel" | "timer";

export interface PowerupEntity {
  id: string;
  kind: PowerupKind;
  pos: Vec2;
  ticksLeft: number; // counts down to despawn
  totalTicks: number;
}

export interface ShovelCell {
  col: number;
  row: number;
  originalKind: TileKind;
}

export interface Explosion {
  id: string;
  pos: Vec2; // center, pixels
  size: "small" | "large"; // large for base/player deaths
  ticksLeft: number;
  totalTicks: number;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  fire: boolean;
}

export type GamePhase = "title" | "playing" | "paused" | "stageClear" | "gameOver";

export interface GameState {
  tick: number;
  phase: GamePhase;
  stageIndex: number;
  map: Cell[][]; // [row][col], GRID_ROWS x GRID_COLS
  spawnPoints: Vec2[];
  playerSpawn: Vec2; // where the player re-appears after dying
  player: Tank;
  playerRespawnTicks: number; // >0 while player is dead and waiting to respawn
  enemies: Tank[];
  pendingSpawns: PendingSpawn[];
  spawnCooldown: number; // ticks until the next spawn attempt
  bullets: Bullet[];
  powerups: PowerupEntity[];
  explosions: Explosion[];
  lives: number;
  score: number;
  enemiesRemainingToSpawn: number; // counts down as new enemies are queued in
  baseAlive: boolean;
  baseShoveled: boolean;
  baseShovelTicksLeft: number;
  shovelCells: ShovelCell[]; // the base-adjacent cells currently steel-plated, and what to revert them to
  frozenEnemiesTicksLeft: number;
  input: InputState;
  muted: boolean;
  rngSeed: number;
}
