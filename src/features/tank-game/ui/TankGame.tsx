import { useEffect, useRef, useState } from "react";
import { createGame, startGame, tick } from "../engine/game";
import { drawFrame } from "../render/draw";
import { CANVAS_PX, TICK_MS } from "../engine/types";
import type { GameState } from "../engine/types";
import HUD, { HUDProps } from "./HUD";

function snapshotHud(state: GameState): HUDProps {
  return {
    remainingEnemies: state.enemiesRemainingToSpawn + state.pendingSpawns.length + state.enemies.filter((e) => e.alive).length,
    lives: state.lives,
    stageNumber: state.stageIndex + 1,
    score: state.score,
  };
}

const KEY_MAP: Record<string, keyof GameState["input"] | undefined> = {
  ArrowUp: "up",
  w: "up",
  W: "up",
  ArrowDown: "down",
  s: "down",
  S: "down",
  ArrowLeft: "left",
  a: "left",
  A: "left",
  ArrowRight: "right",
  d: "right",
  D: "right",
  " ": "fire",
};

// Mounts the canvas, runs a fixed 60Hz simulation step via a RAF
// accumulator (so game speed never depends on display refresh rate), and
// forwards keyboard input. All actual game logic lives in engine/ — this
// component only bridges it to the DOM.
export default function TankGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState>(createGame(0));
  const debugRef = useRef(false);
  const [hud, setHud] = useState<HUDProps>(() => snapshotHud(stateRef.current));

  useEffect(() => {
    stateRef.current = startGame(stateRef.current);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "`") {
        debugRef.current = !debugRef.current;
        return;
      }
      const field = KEY_MAP[e.key];
      if (field) {
        e.preventDefault();
        stateRef.current.input[field] = true;
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      const field = KEY_MAP[e.key];
      if (field) stateRef.current.input[field] = false;
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let raf = 0;
    let last = performance.now();
    let accumulator = 0;

    function frame(now: number) {
      accumulator += now - last;
      last = now;
      // Cap catch-up so a tabbed-out/slow frame can't spiral into a burst
      // of simulation steps all at once.
      if (accumulator > TICK_MS * 10) accumulator = TICK_MS * 10;
      let stepped = false;
      while (accumulator >= TICK_MS) {
        stateRef.current = tick(stateRef.current);
        accumulator -= TICK_MS;
        stepped = true;
      }
      if (ctx) drawFrame(ctx, stateRef.current, debugRef.current);
      // The HUD is React-rendered (not canvas), so it needs an explicit
      // state update — every 10 ticks is plenty for lives/score/stage
      // counters and avoids re-rendering React at 60fps.
      if (stepped && stateRef.current.tick % 10 === 0) setHud(snapshotHud(stateRef.current));
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ display: "flex", gap: "10px", background: "#000", padding: "8px", borderRadius: "8px" }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_PX}
        height={CANVAS_PX}
        style={{ width: CANVAS_PX * 2, height: CANVAS_PX * 2, imageRendering: "pixelated" }}
      />
      <HUD {...hud} />
    </div>
  );
}
