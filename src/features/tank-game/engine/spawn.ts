// Enemy spawn queue: flashing warning first, then the tank actually
// appears with its usual spawn invulnerability. Spawning is blocked if a
// tank already occupies the target tile — the attempt just waits and
// retries rather than losing that enemy from the stage's total.
import { GameState, TankKind } from "./types";
import { isRectSolidForTank } from "./collision";
import { createTank, TANK_SIZE } from "./tank";
import { SPAWN_MAX_ALIVE, SPAWN_INTERVAL_TICKS, SPAWN_RETRY_TICKS, SPAWN_FLASH_TICKS, SPAWN_TOTAL_PER_STAGE, FLASHING_ENEMY_SPAWN_ORDER } from "./constants";

// Rotates through kinds for variety; stage-based difficulty tuning
// (weighting toward tougher kinds on later stages) is a deliberately
// separate, later concern — see the stage-2 note in game.ts.
const KIND_CYCLE: readonly TankKind[] = ["basic", "basic", "fast", "basic", "power", "basic", "armor"];
let kindCycleIndex = 0;

function nextKind(): TankKind {
  const kind = KIND_CYCLE[kindCycleIndex % KIND_CYCLE.length];
  kindCycleIndex += 1;
  return kind;
}

function tileIsFree(state: GameState, x: number, y: number): boolean {
  if (isRectSolidForTank(state.map, x, y, TANK_SIZE, TANK_SIZE)) return false;
  if (state.player.alive && rectsOverlap(x, y, state.player.pos.x, state.player.pos.y)) return false;
  for (const e of state.enemies) {
    if (e.alive && rectsOverlap(x, y, e.pos.x, e.pos.y)) return false;
  }
  return true;
}

function rectsOverlap(ax: number, ay: number, bx: number, by: number): boolean {
  return ax < bx + TANK_SIZE && ax + TANK_SIZE > bx && ay < by + TANK_SIZE && ay + TANK_SIZE > by;
}

let nextSpawnId = 0;

export function updateSpawns(state: GameState): void {
  // Advance flashing spawns; place any that have finished (if the tile's
  // still free — otherwise let it keep flashing and retry next tick).
  const stillPending = [];
  for (const spawn of state.pendingSpawns) {
    spawn.ticksLeft -= 1;
    if (spawn.ticksLeft > 0) {
      stillPending.push(spawn);
      continue;
    }
    if (tileIsFree(state, spawn.pos.x, spawn.pos.y)) {
      state.enemies.push(createTank(spawn.kind, spawn.pos, "down", spawn.flashing));
    } else {
      spawn.ticksLeft = SPAWN_RETRY_TICKS;
      stillPending.push(spawn);
    }
  }
  state.pendingSpawns = stillPending;

  // Queue a new spawn if there's room and the stage isn't fully spawned.
  state.spawnCooldown -= 1;
  if (state.spawnCooldown > 0) return;
  state.spawnCooldown = SPAWN_INTERVAL_TICKS;

  const aliveCount = state.enemies.filter((e) => e.alive).length;
  const inFlightCount = aliveCount + state.pendingSpawns.length;
  if (inFlightCount >= SPAWN_MAX_ALIVE || state.enemiesRemainingToSpawn <= 0) return;
  if (state.spawnPoints.length === 0) return;

  // 1-indexed position of THIS spawn within the stage's 20 — computed
  // before decrementing, so the first enemy spawned this stage is #1.
  const spawnOrder = SPAWN_TOTAL_PER_STAGE - state.enemiesRemainingToSpawn + 1;
  const point = state.spawnPoints[Math.floor(Math.random() * state.spawnPoints.length)];
  state.pendingSpawns.push({
    id: `spawn-${nextSpawnId++}`,
    pos: point,
    kind: nextKind(),
    flashing: FLASHING_ENEMY_SPAWN_ORDER.includes(spawnOrder),
    ticksLeft: SPAWN_FLASH_TICKS,
    totalTicks: SPAWN_FLASH_TICKS,
  });
  state.enemiesRemainingToSpawn -= 1;
}
