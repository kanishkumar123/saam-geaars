// Terrain solidity + AABB movement against the flat Cell grid. Positions
// are pixels; a rect is "solid" if ANY 16px cell it overlaps is solid —
// this is what makes "half-tile precision" real: a brick tile whose two
// sub-cells have been independently chipped away opens a genuine gap a
// tank can slip through, without any special-casing here.
import { Cell, Direction, TileKind, Vec2, GRID_COLS, GRID_ROWS, HALF_TILE_PX } from "./types";

const SOLID_FOR_TANK: ReadonlySet<TileKind> = new Set(["brick", "steel", "water", "base"]);

export function isSolidForTank(kind: TileKind): boolean {
  return SOLID_FOR_TANK.has(kind);
}

export function isSolidForBullet(kind: TileKind, pierceSteel: boolean): boolean {
  if (kind === "brick" || kind === "base") return true;
  if (kind === "steel") return !pierceSteel;
  return false;
}

// The far edge (x+w, y+h) is EXCLUSIVE — a rect ending exactly on a cell
// boundary must not pull in the next cell. Using ceil(edge/16)-1 makes that
// explicit (equivalent to flooring (edge-1)/16 for integer pixels, but
// reads unambiguously as "last cell before the exclusive edge").
function forEachOverlappedCell(x: number, y: number, w: number, h: number, cb: (col: number, row: number) => void) {
  const colStart = Math.floor(x / HALF_TILE_PX);
  const colEnd = Math.ceil((x + w) / HALF_TILE_PX) - 1;
  const rowStart = Math.floor(y / HALF_TILE_PX);
  const rowEnd = Math.ceil((y + h) / HALF_TILE_PX) - 1;
  for (let row = rowStart; row <= rowEnd; row++) {
    for (let col = colStart; col <= colEnd; col++) {
      cb(col, row);
    }
  }
}

// Exposed for the debug overlay: the exact set of cells collision
// considers occupied by a rect, so it can be drawn and visually checked
// against the hitbox.
export function getOverlappedCells(x: number, y: number, w: number, h: number): { col: number; row: number }[] {
  const out: { col: number; row: number }[] = [];
  forEachOverlappedCell(x, y, w, h, (col, row) => out.push({ col, row }));
  return out;
}

// True if the rect touches the field edge or any cell solid-for-tanks.
export function isRectSolidForTank(cells: Cell[][], x: number, y: number, w: number, h: number): boolean {
  if (x < 0 || y < 0 || x + w > GRID_COLS * HALF_TILE_PX || y + h > GRID_ROWS * HALF_TILE_PX) return true;
  let solid = false;
  forEachOverlappedCell(x, y, w, h, (col, row) => {
    if (isSolidForTank(cells[row][col].kind)) solid = true;
  });
  return solid;
}

// True if every cell the rect overlaps is ice — used to decide whether a
// tank is currently "on ice" and should pick up slide momentum.
export function isRectOnIce(cells: Cell[][], x: number, y: number, w: number, h: number): boolean {
  let allIce = true;
  forEachOverlappedCell(x, y, w, h, (col, row) => {
    if (cells[row][col].kind !== "ice") allIce = false;
  });
  return allIce;
}

const DELTA: Record<Direction, Vec2> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

// Moves a rect up to `distance` px along `dir`, stopping at the last free
// pixel if blocked. Stepping 1px at a time (distance is always small — a
// handful of px/tick) means a blocked stop always lands exactly on the
// blocking cell's boundary, i.e. already snapped to the 16px grid — no
// separate rounding step needed.
export function moveWithCollision(pos: Vec2, dir: Direction, distance: number, cells: Cell[][], size: number): { pos: Vec2; collided: boolean } {
  const d = DELTA[dir];
  for (let dist = distance; dist > 0; dist--) {
    const nx = pos.x + d.x * dist;
    const ny = pos.y + d.y * dist;
    if (!isRectSolidForTank(cells, nx, ny, size, size)) {
      return { pos: { x: nx, y: ny }, collided: dist < distance };
    }
  }
  return { pos, collided: true };
}
