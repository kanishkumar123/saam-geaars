// Parses a stage's ASCII rows (13 chars x 13 rows, one char per 32px tile)
// into the flat 26x26 half-tile Cell grid the rest of the engine works
// against. Each source tile expands to a 2x2 block of identical cells;
// brick destruction later flips individual cells to "empty" independently,
// which is how bricks appear to "chip away" without a nested sub-block type.
import { Cell, TileKind, Vec2, GRID_COLS, GRID_ROWS, TILE_PX, HALF_TILE_PX, GRID_TILES } from "./types";
import type { ShovelCell } from "./types";

// '%' doubles as steel for both the field border and interior steel tiles —
// there's no behavioural difference, so one char covers both.
const TILE_CHARS: Record<string, TileKind> = {
  ".": "empty",
  "#": "brick",
  "%": "steel",
  "~": "water",
  T: "trees",
  I: "ice",
  B: "base",
};

// 'P' (player spawn) and 'S' (enemy spawn point) are metadata markers, not
// terrain — the tile underneath them is empty. They're extracted here and
// never stored as a Cell kind.
const MARKER_CHARS = new Set(["P", "S"]);

export interface ParsedStage {
  cells: Cell[][]; // [row][col], GRID_ROWS x GRID_COLS
  spawnPoints: Vec2[]; // enemy spawn points, pixel centers
  playerSpawn: Vec2; // pixel top-left for the player's starting tile
}

export function parseStage(rows: string[]): ParsedStage {
  if (rows.length !== GRID_TILES || rows.some((r) => r.length !== GRID_TILES)) {
    throw new Error(`Stage map must be ${GRID_TILES}x${GRID_TILES} characters`);
  }

  const cells: Cell[][] = Array.from({ length: GRID_ROWS }, () => Array.from({ length: GRID_COLS }, () => ({ kind: "empty" as TileKind })));
  const spawnPoints: Vec2[] = [];
  let playerSpawn: Vec2 | null = null;

  for (let tileRow = 0; tileRow < GRID_TILES; tileRow++) {
    for (let tileCol = 0; tileCol < GRID_TILES; tileCol++) {
      const ch = rows[tileRow][tileCol];
      const kind: TileKind = MARKER_CHARS.has(ch) ? "empty" : (TILE_CHARS[ch] ?? "empty");

      const cellRow = tileRow * 2;
      const cellCol = tileCol * 2;
      cells[cellRow][cellCol] = { kind };
      cells[cellRow][cellCol + 1] = { kind };
      cells[cellRow + 1][cellCol] = { kind };
      cells[cellRow + 1][cellCol + 1] = { kind };

      if (ch === "S") {
        spawnPoints.push({ x: tileCol * TILE_PX, y: tileRow * TILE_PX });
      } else if (ch === "P") {
        playerSpawn = { x: tileCol * TILE_PX, y: tileRow * TILE_PX };
      }
    }
  }

  if (!playerSpawn) throw new Error("Stage map has no 'P' player spawn marker");

  return { cells, spawnPoints, playerSpawn };
}

export function cellAt(cells: Cell[][], col: number, row: number): Cell | null {
  if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return null;
  return cells[row][col];
}

export function pixelToCell(px: number, py: number): { col: number; row: number } {
  return { col: Math.floor(px / HALF_TILE_PX), row: Math.floor(py / HALF_TILE_PX) };
}

export function cellToPixelCenter(col: number, row: number): Vec2 {
  return { x: col * HALF_TILE_PX + HALF_TILE_PX / 2, y: row * HALF_TILE_PX + HALF_TILE_PX / 2 };
}

// The base's position isn't stored anywhere — it's just wherever "base"
// cells are in the map — so anything that needs it (AI targeting, debug
// display) derives it with this scan. Cheap: 26x26 cells, called
// infrequently (AI re-decisions, not every tick).
export function findBaseCenter(cells: Cell[][]): Vec2 | null {
  for (let row = 0; row < cells.length; row++) {
    for (let col = 0; col < cells[row].length; col++) {
      if (cells[row][col].kind === "base") return cellToPixelCenter(col, row);
    }
  }
  return null;
}

// The ring of cells immediately surrounding the base's 2x2 cell block —
// what the Shovel power-up plates with steel. Computed on demand rather
// than stored, same reasoning as findBaseCenter.
export function findBaseAdjacentCells(cells: Cell[][]): ShovelCell[] {
  let anyBaseRow = -1;
  let anyBaseCol = -1;
  for (let row = 0; row < cells.length; row++) {
    for (let col = 0; col < cells[row].length; col++) {
      if (cells[row][col].kind === "base") {
        anyBaseRow = row;
        anyBaseCol = col;
      }
    }
  }
  if (anyBaseRow === -1) return [];
  // "base" cells always form a 2x2 block — round down to its top-left
  // corner, then walk the containing 4x4 neighborhood, keeping everything
  // except the base cells themselves.
  const baseRow = anyBaseRow % 2 === 0 ? anyBaseRow : anyBaseRow - 1;
  const baseCol = anyBaseCol % 2 === 0 ? anyBaseCol : anyBaseCol - 1;
  const out: ShovelCell[] = [];
  for (let row = baseRow - 1; row <= baseRow + 2; row++) {
    for (let col = baseCol - 1; col <= baseCol + 2; col++) {
      if (row < 0 || row >= cells.length || col < 0 || col >= cells[0].length) continue;
      const isBaseCell = row >= baseRow && row <= baseRow + 1 && col >= baseCol && col <= baseCol + 1;
      if (isBaseCell) continue;
      out.push({ col, row, originalKind: cells[row][col].kind });
    }
  }
  return out;
}
