// Every tuning number in the game lives here — speeds, cooldowns, AI
// weights, timers. Nothing else in engine/ should hardcode a balance
// number; import it from here instead. This is the one file to edit to
// change how the game feels.
import { TankKind } from "./types";

export const TANK_SPEED: Record<TankKind, number> = {
  // px/tick at 60 ticks/sec
  player: 2,
  basic: 2,
  fast: 4,
  power: 2,
  armor: 2,
};

export const ICE_SLIDE_TICKS = 14;
export const TURN_SNAP_TOLERANCE_PX = 8;
export const SPAWN_INVULN_TICKS = 60; // 1s

export const BULLET_SPEED_SLOW = 3; // player level 0
export const BULLET_SPEED_FAST = 6; // player level 1+, and enemy "power" kind
export const BULLET_SPEED_NORMAL = 4; // basic/fast/armor enemy bullets
export const BULLET_SIZE_PX = 8; // also the terrain-impact hitbox width — see bullet.ts
export const MAX_PLAYER_BULLETS_BY_LEVEL: readonly number[] = [1, 1, 2, 2]; // index = player.level

export const AI_REDECIDE_MIN_TICKS = 30; // 0.5s
export const AI_REDECIDE_MAX_TICKS = 90; // 1.5s
export const AI_RANDOM_REDECIDE_CHANCE = 0.006; // per-tick chance of an unforced re-decision
export const AI_BASE_BIAS_WEIGHT = 3; // how much more likely a base-ward direction is picked vs. any other; raise to make enemies rush the base harder
export const AI_LOS_ALIGN_TOLERANCE_PX = 10; // how close to dead-on-axis counts as "in the line of fire"
export const AI_FIRE_MIN_TICKS = 45; // 0.75s
export const AI_FIRE_MAX_TICKS = 120; // 2s
export const AI_FIRE_LOS_COOLDOWN_TICKS = 20; // floor between opportunistic LOS shots, so LOS doesn't turn into a machine gun

export const SPAWN_MAX_ALIVE = 4;
export const SPAWN_TOTAL_PER_STAGE = 20;
export const SPAWN_FLASH_TICKS = 30; // 0.5s flashing warning before the tank is actually placed
export const SPAWN_INTERVAL_TICKS = 90; // how often a new spawn is attempted, when there's room
export const SPAWN_RETRY_TICKS = 15; // re-check delay if the target spawn tile was occupied

export const PLAYER_RESPAWN_TICKS = 60; // ~1s delay before respawning
export const PLAYER_RESPAWN_INVULN_TICKS = 180; // 3s flashing invulnerability after (re)spawn
export const PLAYER_FIRE_COOLDOWN_TICKS = 18; // 0.3s between player shots
export const PLAYER_MAX_LEVEL = 3;
export const PLAYER_LIVES_START = 3;

export const EXPLOSION_TICKS_SMALL = 18;
export const EXPLOSION_TICKS_LARGE = 30;

export const ENEMY_SCORE: Record<TankKind, number> = {
  player: 0,
  basic: 100,
  fast: 200,
  power: 300,
  armor: 400,
};

// --- Power-ups ---
// Spawn-order positions (1st, 2nd, ... enemy spawned this stage) that
// flash and drop a power-up when killed. Same set every stage.
export const FLASHING_ENEMY_SPAWN_ORDER: readonly number[] = [4, 11, 18];
export const POWERUP_LIFETIME_TICKS = 1200; // 20s on the field before despawning
export const POWERUP_DESPAWN_WARN_TICKS = 180; // 3s flashing warning before despawn
export const POWERUP_PICKUP_SCORE = 500;

export const HELMET_SHIELD_TICKS = 600; // 10s
export const TIMER_FREEZE_TICKS = 600; // 10s
export const TANK_POWERUP_EXTRA_LIVES = 1;
export const SHOVEL_STEEL_TICKS = 1200; // 20s
export const SHOVEL_WARN_TICKS = 180; // 3s flashing warning before it reverts
