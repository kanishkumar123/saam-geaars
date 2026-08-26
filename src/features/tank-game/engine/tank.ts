// Tank construction + per-tick movement resolution. Movement is shared by
// player and (later) enemies: given a desired direction for this tick, it
// turns the tank to face it, attempts to move, and layers ice momentum on
// top so a tank keeps sliding briefly after input stops.
import { Cell, Direction, Tank, TankKind, Vec2, TILE_PX, HALF_TILE_PX } from "./types";
import { moveWithCollision, isRectOnIce, isRectSolidForTank } from "./collision";
import { TANK_SPEED, ICE_SLIDE_TICKS, TURN_SNAP_TOLERANCE_PX, SPAWN_INVULN_TICKS, PLAYER_RESPAWN_INVULN_TICKS } from "./constants";

export const TANK_SIZE = TILE_PX; // 32px — one tile, matching the original's proportions

function isHorizontal(dir: Direction): boolean {
  return dir === "left" || dir === "right";
}

// When turning onto a perpendicular axis, nudge the tank's position on
// its OLD axis to the nearest 16px grid line — but only within tolerance,
// and only if the nudge itself doesn't land the tank in a wall. This is
// what lets the player just "hold a direction" through a corridor instead
// of manually lining up, matching the original's feel.
function trySnapAlignment(tank: Tank, desiredDir: Direction, cells: Cell[][]): void {
  const wasHorizontal = isHorizontal(tank.dir);
  const willBeHorizontal = isHorizontal(desiredDir);
  if (wasHorizontal === willBeHorizontal) return; // same axis — nothing to snap

  if (willBeHorizontal) {
    // Moving left/right now — align the vertical (y) position.
    const snappedY = Math.round(tank.pos.y / HALF_TILE_PX) * HALF_TILE_PX;
    const dist = Math.abs(tank.pos.y - snappedY);
    if (dist > 0 && dist <= TURN_SNAP_TOLERANCE_PX && !isRectSolidForTank(cells, tank.pos.x, snappedY, TANK_SIZE, TANK_SIZE)) {
      tank.pos.y = snappedY;
    }
  } else {
    // Moving up/down now — align the horizontal (x) position.
    const snappedX = Math.round(tank.pos.x / HALF_TILE_PX) * HALF_TILE_PX;
    const dist = Math.abs(tank.pos.x - snappedX);
    if (dist > 0 && dist <= TURN_SNAP_TOLERANCE_PX && !isRectSolidForTank(cells, snappedX, tank.pos.y, TANK_SIZE, TANK_SIZE)) {
      tank.pos.x = snappedX;
    }
  }
}

let nextTankId = 0;

export function createTank(kind: TankKind, pos: Vec2, dir: Direction = "up", flashing = false): Tank {
  const maxHp = kind === "armor" ? 4 : 1;
  return {
    id: `tank-${nextTankId++}`,
    kind,
    pos: { ...pos },
    dir,
    speed: TANK_SPEED[kind],
    hp: maxHp,
    maxHp,
    level: 0,
    cooldownTicks: 0,
    shieldTicks: 0,
    spawnInvulnTicks: kind === "player" ? PLAYER_RESPAWN_INVULN_TICKS : SPAWN_INVULN_TICKS,
    flashing,
    alive: true,
    slideDir: null,
    slideTicks: 0,
    aiTimer: 0,
    aiReason: null,
  };
}

// `desiredDir` is the direction this tick's input/AI wants to move in, or
// null to attempt no new movement. Facing updates even when the move is
// blocked, per spec ("holding a direction against a wall still rotates
// the tank").
export function updateTankMovement(tank: Tank, desiredDir: Direction | null, cells: Cell[][]): void {
  const onIce = isRectOnIce(cells, tank.pos.x, tank.pos.y, TANK_SIZE, TANK_SIZE);

  if (desiredDir) {
    trySnapAlignment(tank, desiredDir, cells);
    tank.dir = desiredDir;
    const { pos, collided } = moveWithCollision(tank.pos, desiredDir, tank.speed, cells, TANK_SIZE);
    tank.pos = pos;
    if (onIce && !collided) {
      tank.slideDir = desiredDir;
      tank.slideTicks = ICE_SLIDE_TICKS;
    } else {
      tank.slideTicks = 0;
    }
    return;
  }

  // No input this tick — carry over ice momentum, if any, at half speed
  // decaying to a stop as slideTicks runs out.
  if (tank.slideTicks > 0 && tank.slideDir) {
    const { pos, collided } = moveWithCollision(tank.pos, tank.slideDir, tank.speed, cells, TANK_SIZE);
    tank.pos = pos;
    tank.slideTicks -= 1;
    if (collided) tank.slideTicks = 0;
  }
}
