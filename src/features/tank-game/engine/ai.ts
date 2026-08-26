// Deliberately dumb enemy "AI" — no pathfinding, no A*, no BFS. An enemy
// just holds a direction and a re-decision timer:
//   - re-decide when blocked, when the timer expires, or on a small
//     random chance each tick
//   - on re-decide, pick among the directions that aren't immediately
//     blocked, weighted toward whichever reduces distance to the base
// The janky, sometimes-suboptimal movement that falls out of this is the
// intended arcade feel — resist the urge to make it smarter.
import { Cell, Direction, Tank, Vec2 } from "./types";
import { isRectSolidForTank, isSolidForBullet } from "./collision";
import { TANK_SIZE } from "./tank";
import {
  AI_REDECIDE_MIN_TICKS,
  AI_REDECIDE_MAX_TICKS,
  AI_RANDOM_REDECIDE_CHANCE,
  AI_BASE_BIAS_WEIGHT,
  AI_LOS_ALIGN_TOLERANCE_PX,
  AI_FIRE_MIN_TICKS,
  AI_FIRE_MAX_TICKS,
  AI_FIRE_LOS_COOLDOWN_TICKS,
} from "./constants";
import { HALF_TILE_PX } from "./types";

const ALL_DIRECTIONS: readonly Direction[] = ["up", "down", "left", "right"];

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// Directions the tank could actually move into right now (not already
// blocked one pixel in). Falls back to all four if it's fully boxed in,
// rather than returning an empty list a caller would have to special-case.
function availableDirections(tank: Tank, cells: Cell[][]): Direction[] {
  const STEP = 1;
  const DELTA: Record<Direction, Vec2> = { up: { x: 0, y: -STEP }, down: { x: 0, y: STEP }, left: { x: -STEP, y: 0 }, right: { x: STEP, y: 0 } };
  const open = ALL_DIRECTIONS.filter((dir) => {
    const d = DELTA[dir];
    return !isRectSolidForTank(cells, tank.pos.x + d.x, tank.pos.y + d.y, TANK_SIZE, TANK_SIZE);
  });
  return open.length > 0 ? open : [...ALL_DIRECTIONS];
}

// Which of the 4 directions reduce distance to `target` — up to two (one
// per axis), used to bias the weighted pick, not to force a choice.
function directionsTowardTarget(from: Vec2, target: Vec2): Set<Direction> {
  const biased = new Set<Direction>();
  if (target.x < from.x) biased.add("left");
  else if (target.x > from.x) biased.add("right");
  if (target.y < from.y) biased.add("up");
  else if (target.y > from.y) biased.add("down");
  return biased;
}

function weightedPick(options: Direction[], biased: Set<Direction>): Direction {
  const weights = options.map((dir) => (biased.has(dir) ? AI_BASE_BIAS_WEIGHT : 1));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < options.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return options[i];
  }
  return options[options.length - 1];
}

// Picks a new travel direction, biased toward the base — the single
// tunable knob for this is AI_BASE_BIAS_WEIGHT in constants.ts.
export function decideDirection(tank: Tank, cells: Cell[][], basePos: Vec2 | null): Direction {
  const available = availableDirections(tank, cells);
  const biased = basePos ? directionsTowardTarget(tank.pos, basePos) : new Set<Direction>();
  return weightedPick(available, biased);
}

// Ticks the re-decision timer and returns whether (and why) this enemy
// should pick a new direction before moving this tick. Does NOT itself
// change tank.dir — game.ts calls decideDirection() separately once it
// knows a redecide is needed (including the "blocked" case, which can
// only be known after attempting to move).
export function shouldRedecide(tank: Tank): "timer" | "random" | null {
  if (tank.aiTimer <= 0) return "timer";
  if (Math.random() < AI_RANDOM_REDECIDE_CHANCE) return "random";
  return null;
}

export function resetRedecideTimer(tank: Tank): void {
  tank.aiTimer = randInt(AI_REDECIDE_MIN_TICKS, AI_REDECIDE_MAX_TICKS);
}

// Raycasts from the tank's facing edge toward `target`, at cell
// granularity, stopping at the first bullet-solid cell. True only if the
// target is roughly dead-ahead on the tank's current facing axis AND
// nothing blocks the line between them.
export function hasLineOfSight(tank: Tank, target: Vec2, cells: Cell[][]): boolean {
  const cx = tank.pos.x + TANK_SIZE / 2;
  const cy = tank.pos.y + TANK_SIZE / 2;
  const tx = target.x;
  const ty = target.y;

  const horizontal = tank.dir === "left" || tank.dir === "right";
  if (horizontal) {
    if (Math.abs(cy - ty) > AI_LOS_ALIGN_TOLERANCE_PX) return false;
    if (tank.dir === "right" && tx <= cx) return false;
    if (tank.dir === "left" && tx >= cx) return false;
  } else {
    if (Math.abs(cx - tx) > AI_LOS_ALIGN_TOLERANCE_PX) return false;
    if (tank.dir === "down" && ty <= cy) return false;
    if (tank.dir === "up" && ty >= cy) return false;
  }

  const steps = Math.floor(Math.max(Math.abs(tx - cx), Math.abs(ty - cy)) / HALF_TILE_PX);
  for (let i = 1; i <= steps; i++) {
    const x = horizontal ? cx + (tank.dir === "right" ? 1 : -1) * i * HALF_TILE_PX : cx;
    const y = horizontal ? cy : cy + (tank.dir === "down" ? 1 : -1) * i * HALF_TILE_PX;
    const col = Math.floor(x / HALF_TILE_PX);
    const row = Math.floor(y / HALF_TILE_PX);
    if (row < 0 || row >= cells.length || col < 0 || col >= cells[0].length) return false;
    if (isSolidForBullet(cells[row][col].kind, false)) return false;
  }
  return true;
}

// Whether this enemy currently has base or player dead-ahead and
// unobstructed — game.ts uses this both to decide whether a ready-to-fire
// enemy should shoot now and to pick how long its next reload is.
export function checkFireLineOfSight(tank: Tank, basePos: Vec2 | null, playerPos: Vec2 | null, playerAlive: boolean, cells: Cell[][]): boolean {
  const seesBase = basePos ? hasLineOfSight(tank, basePos, cells) : false;
  const seesPlayer = playerAlive && playerPos ? hasLineOfSight(tank, playerPos, cells) : false;
  return seesBase || seesPlayer;
}

// Reload time after a shot: short while a target is lined up (so an
// enemy that's caught the player/base in its sights keeps firing at
// them — the "PLUS immediately" half of the spec), otherwise the full
// randomized baseline interval.
export function resetFireTimer(tank: Tank, hadLineOfSight: boolean): void {
  tank.cooldownTicks = hadLineOfSight ? AI_FIRE_LOS_COOLDOWN_TICKS : randInt(AI_FIRE_MIN_TICKS, AI_FIRE_MAX_TICKS);
}
