// Power-up lifecycle: drop on a flashing-enemy kill, lifetime + despawn
// warning, player pickup + effect application. Only one power-up is ever
// on the field — a new drop replaces whatever's there.
import { GameState, PowerupKind, TileKind, GRID_TILES } from "./types";
import { isRectSolidForTank } from "./collision";
import { findBaseAdjacentCells } from "./map";
import { TANK_SIZE } from "./tank";
import { killTank } from "./bullet";
import {
  POWERUP_LIFETIME_TICKS,
  POWERUP_PICKUP_SCORE,
  HELMET_SHIELD_TICKS,
  TIMER_FREEZE_TICKS,
  TANK_POWERUP_EXTRA_LIVES,
  SHOVEL_STEEL_TICKS,
  PLAYER_MAX_LEVEL,
} from "./constants";

const KIND_CYCLE: readonly PowerupKind[] = ["helmet", "star", "grenade", "tank", "shovel", "timer"];
let kindCycleIndex = 0;
let nextPowerupId = 0;

function pickRandomFreeTile(state: GameState): { x: number; y: number } | null {
  // Random tile-aligned positions, retried a bounded number of times
  // rather than scanning/collecting every free tile — the field is
  // mostly open, so this converges fast and stays O(1)-ish.
  for (let attempt = 0; attempt < 60; attempt++) {
    const tileCol = Math.floor(Math.random() * (GRID_TILES - 2)) + 1;
    const tileRow = Math.floor(Math.random() * (GRID_TILES - 2)) + 1;
    const x = tileCol * TANK_SIZE;
    const y = tileRow * TANK_SIZE;
    if (!isRectSolidForTank(state.map, x, y, TANK_SIZE, TANK_SIZE)) return { x, y };
  }
  return null;
}

// Called on a flashing enemy's death — drops at a random non-solid tile,
// NOT at the kill location, replacing any power-up already on the field.
export function spawnPowerupDrop(state: GameState): void {
  const pos = pickRandomFreeTile(state);
  if (!pos) return;
  const kind = KIND_CYCLE[kindCycleIndex % KIND_CYCLE.length];
  kindCycleIndex += 1;
  state.powerups = [
    {
      id: `powerup-${nextPowerupId++}`,
      kind,
      pos,
      ticksLeft: POWERUP_LIFETIME_TICKS,
      totalTicks: POWERUP_LIFETIME_TICKS,
    },
  ];
}

function rectsOverlap(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// All six effects. Overlapping pickups of the same effect ADD to the
// remaining duration rather than resetting it, per spec.
function applyEffect(kind: PowerupKind, state: GameState): void {
  const player = state.player;
  switch (kind) {
    case "helmet":
      player.shieldTicks += HELMET_SHIELD_TICKS;
      break;
    case "star":
      player.level = Math.min(PLAYER_MAX_LEVEL, player.level + 1);
      break;
    case "grenade":
      for (const enemy of state.enemies) {
        if (enemy.alive) killTank(enemy, state, false); // no drops from grenade kills
      }
      break;
    case "tank":
      state.lives += TANK_POWERUP_EXTRA_LIVES;
      break;
    case "shovel":
      applyShovel(state);
      break;
    case "timer":
      state.frozenEnemiesTicksLeft += TIMER_FREEZE_TICKS;
      break;
  }
}

function applyShovel(state: GameState): void {
  if (state.baseShovelTicksLeft <= 0) {
    // Not currently active — snapshot what's there now so it can be
    // restored exactly, then plate it with steel.
    state.shovelCells = findBaseAdjacentCells(state.map);
    for (const { col, row } of state.shovelCells) {
      state.map[row][col].kind = "steel";
    }
    state.baseShoveled = true;
  }
  // Already active: just extend the timer, cells are already steel.
  state.baseShovelTicksLeft += SHOVEL_STEEL_TICKS;
}

export function revertShovel(state: GameState): void {
  for (const { col, row, originalKind } of state.shovelCells) {
    state.map[row][col].kind = originalKind as TileKind;
  }
  state.shovelCells = [];
  state.baseShoveled = false;
}

// Ticks lifetime/despawn and resolves player pickup. Called once per tick
// from game.ts.
export function updatePowerups(state: GameState): void {
  if (state.powerups.length === 0) return;
  const p = state.powerups[0];

  if (state.player.alive && rectsOverlap(p.pos.x, p.pos.y, TANK_SIZE, TANK_SIZE, state.player.pos.x, state.player.pos.y, TANK_SIZE, TANK_SIZE)) {
    state.score += POWERUP_PICKUP_SCORE;
    applyEffect(p.kind, state);
    state.powerups = [];
    return;
  }

  p.ticksLeft -= 1;
  if (p.ticksLeft <= 0) state.powerups = [];
}
