// Bullet spawning + per-tick movement/collision resolution. A bullet's
// terrain hitbox uses the same cell-overlap helper as tank collision
// (getOverlappedCells) so hitting a brick tile right at a cell boundary
// naturally destroys both straddled cells — no special-casing needed.
import { Bullet, Direction, GameState, Tank, Vec2, HALF_TILE_PX, GRID_COLS, GRID_ROWS } from "./types";
import { getOverlappedCells } from "./collision";
import { TANK_SIZE } from "./tank";
import { spawnPowerupDrop } from "./powerup";
import {
  BULLET_SPEED_SLOW,
  BULLET_SPEED_FAST,
  BULLET_SPEED_NORMAL,
  BULLET_SIZE_PX,
  EXPLOSION_TICKS_SMALL,
  EXPLOSION_TICKS_LARGE,
  ENEMY_SCORE,
  PLAYER_RESPAWN_TICKS,
} from "./constants";

let nextBulletId = 0;

const MUZZLE_OFFSET: Record<Direction, Vec2> = {
  up: { x: TANK_SIZE / 2, y: 0 },
  down: { x: TANK_SIZE / 2, y: TANK_SIZE },
  left: { x: 0, y: TANK_SIZE / 2 },
  right: { x: TANK_SIZE, y: TANK_SIZE / 2 },
};

function bulletSpeedFor(owner: Tank): number {
  if (owner.kind === "player") return owner.level >= 1 ? BULLET_SPEED_FAST : BULLET_SPEED_SLOW;
  if (owner.kind === "power") return BULLET_SPEED_FAST;
  return BULLET_SPEED_NORMAL;
}

// Spawns at the muzzle (the tank's leading edge, centered on its facing
// axis) rather than the tank's center, so the bullet visibly leaves the
// barrel instead of the tank's middle.
export function spawnBullet(owner: Tank): Bullet {
  const offset = MUZZLE_OFFSET[owner.dir];
  return {
    id: `bullet-${nextBulletId++}`,
    ownerId: owner.id,
    ownerKind: owner.kind,
    pos: { x: owner.pos.x + offset.x - BULLET_SIZE_PX / 2, y: owner.pos.y + offset.y - BULLET_SIZE_PX / 2 },
    dir: owner.dir,
    speed: bulletSpeedFor(owner),
    pierceSteel: owner.kind === "player" && owner.level >= 3,
  };
}

const DELTA: Record<Direction, Vec2> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function rectsOverlap(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// Advances every bullet one tick, resolving (in order): out-of-bounds
// despawn, terrain impact (brick destroy / steel block / base = game
// over), bullet-vs-bullet mutual despawn, and bullet-vs-tank damage.
// Mutates `state` in place — called once per tick from game.ts.
export function stepBullets(state: GameState): void {
  const boundsPx = { w: GRID_COLS * HALF_TILE_PX, h: GRID_ROWS * HALF_TILE_PX };

  for (const b of state.bullets) {
    const d = DELTA[b.dir];
    b.pos.x += d.x * b.speed;
    b.pos.y += d.y * b.speed;
  }

  state.bullets = state.bullets.filter((b) => b.pos.x >= 0 && b.pos.y >= 0 && b.pos.x + BULLET_SIZE_PX <= boundsPx.w && b.pos.y + BULLET_SIZE_PX <= boundsPx.h);

  resolveTerrainImpacts(state);
  resolveBulletVsBullet(state);
  resolveBulletVsTanks(state);
}

function resolveTerrainImpacts(state: GameState): void {
  const survivors: Bullet[] = [];
  for (const b of state.bullets) {
    const cells = getOverlappedCells(b.pos.x, b.pos.y, BULLET_SIZE_PX, BULLET_SIZE_PX);
    let stopped = false;
    for (const { col, row } of cells) {
      if (row < 0 || row >= state.map.length || col < 0 || col >= state.map[0].length) continue;
      const cell = state.map[row][col];
      if (cell.kind === "base") {
        state.baseAlive = false;
        state.phase = "gameOver";
        stopped = true;
        continue;
      }
      if (cell.kind === "brick") {
        cell.kind = "empty";
        stopped = true;
      } else if (cell.kind === "steel") {
        if (b.pierceSteel) cell.kind = "empty";
        stopped = true;
      }
    }
    if (!stopped) survivors.push(b);
  }
  state.bullets = survivors;
}

function resolveBulletVsBullet(state: GameState): void {
  const dead = new Set<string>();
  const bullets = state.bullets;
  for (let i = 0; i < bullets.length; i++) {
    if (dead.has(bullets[i].id)) continue;
    for (let j = i + 1; j < bullets.length; j++) {
      if (dead.has(bullets[j].id)) continue;
      const a = bullets[i];
      const c = bullets[j];
      if (a.ownerKind === c.ownerKind) continue; // same side — no friendly-fire despawn
      if (rectsOverlap(a.pos.x, a.pos.y, BULLET_SIZE_PX, BULLET_SIZE_PX, c.pos.x, c.pos.y, BULLET_SIZE_PX, BULLET_SIZE_PX)) {
        dead.add(a.id);
        dead.add(c.id);
      }
    }
  }
  if (dead.size > 0) state.bullets = state.bullets.filter((b) => !dead.has(b.id));
}

// Kills a tank outright: explosion, score/lives bookkeeping, and — for a
// flashing enemy killed normally — a power-up drop. `awardDrop: false` is
// how the grenade power-up kills enemies without chaining more drops.
export function killTank(tank: Tank, state: GameState, awardDrop: boolean): void {
  tank.alive = false;
  state.explosions.push({
    id: `explosion-${tank.id}-${state.tick}`,
    pos: { x: tank.pos.x + TANK_SIZE / 2, y: tank.pos.y + TANK_SIZE / 2 },
    size: tank.kind === "player" ? "large" : "small",
    ticksLeft: tank.kind === "player" ? EXPLOSION_TICKS_LARGE : EXPLOSION_TICKS_SMALL,
    totalTicks: tank.kind === "player" ? EXPLOSION_TICKS_LARGE : EXPLOSION_TICKS_SMALL,
  });

  if (tank.kind === "player") {
    state.lives -= 1;
    state.phase = state.lives <= 0 ? "gameOver" : "playing";
    if (state.lives > 0) state.playerRespawnTicks = PLAYER_RESPAWN_TICKS;
    return;
  }

  state.score += ENEMY_SCORE[tank.kind];
  if (awardDrop && tank.flashing) spawnPowerupDrop(state);
}

function damageTank(tank: Tank, state: GameState): void {
  if (tank.spawnInvulnTicks > 0 || tank.shieldTicks > 0) return;
  tank.hp -= 1;
  if (tank.hp > 0) return;
  killTank(tank, state, true);
}

function resolveBulletVsTanks(state: GameState): void {
  const survivors: Bullet[] = [];
  for (const b of state.bullets) {
    let hit = false;

    if (b.ownerKind !== "player" && state.player.alive && b.ownerId !== state.player.id) {
      if (rectsOverlap(b.pos.x, b.pos.y, BULLET_SIZE_PX, BULLET_SIZE_PX, state.player.pos.x, state.player.pos.y, TANK_SIZE, TANK_SIZE)) {
        damageTank(state.player, state);
        hit = true;
      }
    }

    if (!hit && b.ownerKind === "player") {
      for (const enemy of state.enemies) {
        if (!enemy.alive) continue;
        if (rectsOverlap(b.pos.x, b.pos.y, BULLET_SIZE_PX, BULLET_SIZE_PX, enemy.pos.x, enemy.pos.y, TANK_SIZE, TANK_SIZE)) {
          damageTank(enemy, state);
          hit = true;
          break;
        }
      }
    }

    if (!hit) survivors.push(b);
  }
  state.bullets = survivors;
}

export function countBulletsOwnedBy(state: GameState, ownerId: string): number {
  return state.bullets.filter((b) => b.ownerId === ownerId).length;
}
