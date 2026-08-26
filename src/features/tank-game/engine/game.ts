// The game state machine. `tick()` advances the simulation by exactly one
// 60Hz step and is meant to be called from a fixed-timestep accumulator in
// the mount component — nothing in here reads wall-clock time.
import { GameState, InputState, Direction, Tank, Vec2 } from "./types";
import { parseStage, findBaseCenter } from "./map";
import { STAGES } from "./stages";
import { createTank, updateTankMovement, TANK_SIZE } from "./tank";
import { decideDirection, shouldRedecide, resetRedecideTimer, checkFireLineOfSight, resetFireTimer } from "./ai";
import { spawnBullet, stepBullets, countBulletsOwnedBy, rectsOverlap } from "./bullet";
import { updateSpawns } from "./spawn";
import { updatePowerups, revertShovel } from "./powerup";
import {
  MAX_PLAYER_BULLETS_BY_LEVEL,
  PLAYER_FIRE_COOLDOWN_TICKS,
  PLAYER_RESPAWN_INVULN_TICKS,
  SPAWN_TOTAL_PER_STAGE,
  SHOVEL_WARN_TICKS,
} from "./constants";

export function createGame(stageIndex = 0): GameState {
  const { cells, spawnPoints, playerSpawn } = parseStage(STAGES[stageIndex % STAGES.length]);
  return {
    tick: 0,
    phase: "title",
    stageIndex,
    map: cells,
    spawnPoints,
    playerSpawn,
    player: createTank("player", playerSpawn, "up"),
    playerRespawnTicks: 0,
    enemies: [],
    pendingSpawns: [],
    spawnCooldown: 30,
    bullets: [],
    powerups: [],
    explosions: [],
    lives: 3,
    score: 0,
    enemiesRemainingToSpawn: SPAWN_TOTAL_PER_STAGE,
    baseAlive: true,
    baseShoveled: false,
    baseShovelTicksLeft: 0,
    shovelCells: [],
    frozenEnemiesTicksLeft: 0,
    input: { up: false, down: false, left: false, right: false, fire: false },
    muted: false,
    rngSeed: Date.now() & 0xffffffff,
  };
}

// Only one of up/down/left/right can drive movement in a given tick — this
// fixed priority order picks which when multiple keys are held.
function resolveDesiredDirection(input: InputState): Direction | null {
  if (input.up) return "up";
  if (input.down) return "down";
  if (input.left) return "left";
  if (input.right) return "right";
  return null;
}

function updatePlayer(state: GameState): void {
  const p = state.player;

  if (!p.alive) {
    if (state.playerRespawnTicks > 0) {
      state.playerRespawnTicks -= 1;
      if (state.playerRespawnTicks === 0) {
        p.pos = { ...state.playerSpawn };
        p.dir = "up";
        p.hp = p.maxHp;
        p.alive = true;
        p.level = 0; // upgrades reset on death, per spec
        p.spawnInvulnTicks = PLAYER_RESPAWN_INVULN_TICKS;
        p.slideDir = null;
        p.slideTicks = 0;
      }
    }
    return;
  }

  if (p.spawnInvulnTicks > 0) p.spawnInvulnTicks -= 1;
  if (p.shieldTicks > 0) p.shieldTicks -= 1;
  if (p.cooldownTicks > 0) p.cooldownTicks -= 1;

  const desiredDir = resolveDesiredDirection(state.input);
  updateTankMovement(p, desiredDir, state.map);

  const maxBullets = MAX_PLAYER_BULLETS_BY_LEVEL[Math.min(p.level, MAX_PLAYER_BULLETS_BY_LEVEL.length - 1)];
  if (state.input.fire && p.cooldownTicks <= 0 && countBulletsOwnedBy(state, p.id) < maxBullets) {
    state.bullets.push(spawnBullet(p));
    p.cooldownTicks = PLAYER_FIRE_COOLDOWN_TICKS;
  }
}

function updateEnemy(enemy: Tank, state: GameState, basePos: ReturnType<typeof findBaseCenter>, frozen: boolean): void {
  if (enemy.spawnInvulnTicks > 0) enemy.spawnInvulnTicks -= 1;

  // Frozen (Timer power-up): holds position, can't act, but still sits
  // in state.enemies — so it's still hittable and still blocks movement.
  if (frozen) return;

  const reason = shouldRedecide(enemy);
  if (reason) {
    enemy.dir = decideDirection(enemy, state.map, basePos);
    enemy.aiReason = reason;
    resetRedecideTimer(enemy);
  }

  const before = { x: enemy.pos.x, y: enemy.pos.y };
  updateTankMovement(enemy, enemy.dir, state.map);
  const moved = enemy.pos.x !== before.x || enemy.pos.y !== before.y;
  if (!moved) {
    enemy.dir = decideDirection(enemy, state.map, basePos);
    enemy.aiReason = "blocked";
    resetRedecideTimer(enemy);
    updateTankMovement(enemy, enemy.dir, state.map);
  }

  if (enemy.cooldownTicks > 0) enemy.cooldownTicks -= 1;
  if (enemy.cooldownTicks <= 0) {
    const hasLOS = checkFireLineOfSight(enemy, basePos, state.player.pos, state.player.alive, state.map);
    state.bullets.push(spawnBullet(enemy));
    resetFireTimer(enemy, hasLOS);
  }
}

// Tanks don't push through each other. Movement already happened this
// tick (each tank resolved its own terrain collision independently); this
// is a simple post-pass that reverts anyone who ended up overlapping
// another tank back to where they started the tick. Crude but consistent
// with the rest of the game's "dumb and simple" collision handling.
function resolveTankOverlaps(state: GameState, before: Map<string, Vec2>): void {
  const tanks = [state.player, ...state.enemies].filter((t) => t.alive);
  for (let i = 0; i < tanks.length; i++) {
    for (let j = i + 1; j < tanks.length; j++) {
      const a = tanks[i];
      const b = tanks[j];
      if (!rectsOverlap(a.pos.x, a.pos.y, TANK_SIZE, TANK_SIZE, b.pos.x, b.pos.y, TANK_SIZE, TANK_SIZE)) continue;
      const beforeA = before.get(a.id);
      const beforeB = before.get(b.id);
      if (beforeA) a.pos = beforeA;
      if (beforeB) b.pos = beforeB;
    }
  }
}

function maybeAdvanceStage(state: GameState): void {
  const stageClear = state.enemiesRemainingToSpawn <= 0 && state.enemies.length === 0 && state.pendingSpawns.length === 0;
  if (!stageClear) return;

  const nextIndex = state.stageIndex + 1;
  const { cells, spawnPoints, playerSpawn } = parseStage(STAGES[nextIndex % STAGES.length]);

  state.stageIndex = nextIndex;
  state.map = cells;
  state.spawnPoints = spawnPoints;
  state.playerSpawn = playerSpawn;
  state.player.pos = { ...playerSpawn };
  state.player.dir = "up";

  state.enemies = [];
  state.pendingSpawns = [];
  state.bullets = [];
  state.powerups = [];
  state.explosions = [];
  state.enemiesRemainingToSpawn = SPAWN_TOTAL_PER_STAGE;
  state.spawnCooldown = 30;
  state.baseAlive = true;
  state.baseShoveled = false;
  state.baseShovelTicksLeft = 0;
  state.shovelCells = [];
  state.frozenEnemiesTicksLeft = 0;
  // score, lives, and player.level deliberately carry over.
}

export function tick(state: GameState): GameState {
  if (state.phase !== "playing") return state;

  state.tick += 1;

  const before = new Map<string, Vec2>();
  before.set(state.player.id, { ...state.player.pos });
  for (const e of state.enemies) before.set(e.id, { ...e.pos });

  updatePlayer(state);

  const basePos = findBaseCenter(state.map);
  const frozen = state.frozenEnemiesTicksLeft > 0;
  for (const enemy of state.enemies) {
    if (enemy.alive) updateEnemy(enemy, state, basePos, frozen);
  }
  if (state.frozenEnemiesTicksLeft > 0) state.frozenEnemiesTicksLeft -= 1;

  resolveTankOverlaps(state, before);

  updateSpawns(state);
  updatePowerups(state);
  stepBullets(state);

  if (state.baseShovelTicksLeft > 0) {
    state.baseShovelTicksLeft -= 1;
    if (state.baseShovelTicksLeft <= 0) revertShovel(state);
  }

  state.enemies = state.enemies.filter((e) => e.alive);

  for (const explosion of state.explosions) explosion.ticksLeft -= 1;
  state.explosions = state.explosions.filter((e) => e.ticksLeft > 0);

  maybeAdvanceStage(state);

  return state;
}

export function startGame(state: GameState): GameState {
  state.phase = "playing";
  return state;
}

// Exposed for the HUD/debug overlay: is the base's steel plating about to
// revert? (last SHOVEL_WARN_TICKS of its duration)
export function isShovelWarning(state: GameState): boolean {
  return state.baseShoveled && state.baseShovelTicksLeft > 0 && state.baseShovelTicksLeft <= SHOVEL_WARN_TICKS;
}
