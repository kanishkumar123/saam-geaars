// Frame renderer. Draw order matters for a few things: the base is one
// tile-sized icon (not per half-cell), tanks sit on top of ground terrain,
// and trees are drawn last so they visually hide tanks underneath them.
import { GameState, GRID_TILES, HALF_TILE_PX, TILE_PX } from "../engine/types";
import { drawCellTerrain, drawTreeCell, drawBase, drawPlayerTank, drawEnemyTank, drawBullet, drawSpawnFlash, drawExplosion, drawShield, drawPowerupIcon } from "./sprites";
import { TANK_SIZE } from "../engine/tank";
import { getOverlappedCells } from "../engine/collision";
import { BULLET_SIZE_PX, POWERUP_DESPAWN_WARN_TICKS } from "../engine/constants";
import { isShovelWarning } from "../engine/game";

export function drawFrame(ctx: CanvasRenderingContext2D, state: GameState, debug: boolean) {
  const canvasPx = GRID_TILES * TILE_PX;
  ctx.fillStyle = "#0b0f0a";
  ctx.fillRect(0, 0, canvasPx, canvasPx);

  // Ground terrain, per half-tile cell (base + trees handled separately below).
  const shovelWarn = isShovelWarning(state);
  const shovelBlinkOff = shovelWarn && Math.floor(state.tick / 8) % 2 === 0;
  const shovelCellKeys = shovelWarn ? new Set(state.shovelCells.map((c) => `${c.row},${c.col}`)) : null;
  for (let row = 0; row < state.map.length; row++) {
    for (let col = 0; col < state.map[row].length; col++) {
      const kind = state.map[row][col].kind;
      if (kind === "base" || kind === "trees") continue;
      if (shovelBlinkOff && shovelCellKeys?.has(`${row},${col}`)) continue; // flash: steel plating about to revert
      drawCellTerrain(ctx, kind, col * HALF_TILE_PX, row * HALF_TILE_PX);
    }
  }

  // Base — drawn once per whole tile, using the top-left sub-cell of each
  // tile as the source of truth for "is this tile a base tile".
  for (let tileRow = 0; tileRow < GRID_TILES; tileRow++) {
    for (let tileCol = 0; tileCol < GRID_TILES; tileCol++) {
      if (state.map[tileRow * 2][tileCol * 2].kind === "base") {
        drawBase(ctx, tileCol * TILE_PX, tileRow * TILE_PX, state.baseAlive);
      }
    }
  }

  for (const spawn of state.pendingSpawns) {
    drawSpawnFlash(ctx, spawn.pos.x, spawn.pos.y, TANK_SIZE, spawn.ticksLeft);
  }

  for (const p of state.powerups) {
    const warn = p.ticksLeft <= POWERUP_DESPAWN_WARN_TICKS;
    drawPowerupIcon(ctx, p.kind, p.pos.x, p.pos.y, TANK_SIZE, warn);
  }

  if (state.player.alive) {
    drawPlayerTank(ctx, state.player.pos.x, state.player.pos.y, state.player.dir, TANK_SIZE, state.player.level, state.player.spawnInvulnTicks > 0);
    if (state.player.shieldTicks > 0) drawShield(ctx, state.player.pos.x, state.player.pos.y, TANK_SIZE);
  }
  for (const enemy of state.enemies) {
    drawEnemyTank(ctx, enemy.pos.x, enemy.pos.y, enemy.dir, TANK_SIZE, enemy.kind, enemy.hp, enemy.spawnInvulnTicks > 0);
  }

  for (const bullet of state.bullets) {
    drawBullet(ctx, bullet.pos.x, bullet.pos.y, BULLET_SIZE_PX, bullet.ownerKind === "player");
  }

  // Trees drawn last so they occlude tanks/bullets passing underneath.
  for (let row = 0; row < state.map.length; row++) {
    for (let col = 0; col < state.map[row].length; col++) {
      if (state.map[row][col].kind === "trees") drawTreeCell(ctx, col * HALF_TILE_PX, row * HALF_TILE_PX);
    }
  }

  for (const explosion of state.explosions) {
    const progress = 1 - explosion.ticksLeft / explosion.totalTicks;
    drawExplosion(ctx, explosion.pos.x, explosion.pos.y, progress, explosion.size === "large");
  }

  if (debug) drawDebugOverlay(ctx, state);
}

function drawDebugOverlay(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.save();
  ctx.font = "10px monospace";
  ctx.fillStyle = "#00ff88";
  ctx.textBaseline = "top";
  ctx.fillText(`tick ${state.tick}`, 4, 4);

  drawHitboxAndCells(ctx, state.player.pos.x, state.player.pos.y, "#00ff88");
  ctx.fillStyle = "#00ff88";
  ctx.fillText(`P ${Math.round(state.player.pos.x)},${Math.round(state.player.pos.y)} ${state.player.dir}`, state.player.pos.x, state.player.pos.y - 12);

  // Enemy hitboxes + AI direction / re-decision timer / last decision
  // reason — enemies share updateTankMovement with the player, so this is
  // also how to confirm they inherit turn-snap (no visible getting stuck
  // at corridor mouths that a player wouldn't also get stuck at).
  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;
    drawHitboxAndCells(ctx, enemy.pos.x, enemy.pos.y, "#ff6b6b");
    ctx.fillStyle = "#ff6b6b";
    ctx.fillText(`${enemy.dir} t${enemy.aiTimer} ${enemy.aiReason ?? ""}`, enemy.pos.x - 6, enemy.pos.y - 12);
  }

  ctx.restore();
}

// Draws both the tank's pixel hitbox (stroked rect, should exactly match
// the drawn sprite) AND the set of 16px cells collision.ts considers
// occupied for that hitbox (filled), so the two can be visually compared
// — this is the actual "does collision match the hitbox" check.
function drawHitboxAndCells(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.25;
  for (const { col, row } of getOverlappedCells(x, y, TANK_SIZE, TANK_SIZE)) {
    ctx.fillRect(col * HALF_TILE_PX, row * HALF_TILE_PX, HALF_TILE_PX, HALF_TILE_PX);
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, TANK_SIZE, TANK_SIZE);
}
