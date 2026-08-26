// Hand-designed stage layouts. Each is 13 rows x 13 chars — read it as
// ASCII art, one character per 32px tile:
//
//   .  empty        #  brick (destructible)     %  steel (blocks bullets)
//   ~  water         T  trees (drawn over tanks)  I  ice (tanks slide)
//   B  base — the eagle icon; a bullet hit here ends the game regardless
//      of remaining lives. Surround it with brick, not steel, on the map.
//   P  player spawn point (exactly one required)
//   S  enemy spawn point (place three, typically along the top)
//
// To add a stage: append another 13-row block to STAGES below. Difficulty
// (enemy speed/aggression) scales by stage index in game.ts, not by
// anything in the map itself — keep new maps focused purely on layout.
export const STAGES: string[][] = [
  [
    "%%%%%%%%%%%%%",
    "%S..#.S.#..S%",
    "%...........%",
    "%T.#.#.#.#.T%",
    "%...........%",
    "%#.%.....%.#%",
    "%...........%",
    "%#.%.....%.#%",
    "%...........%",
    "%T.#.#.#.#.T%",
    "%...........%",
    "%P..#####..I%",
    "%....##B##..%",
  ],
  [
    "%%%%%%%%%%%%%",
    "%S..#.S.#..S%",
    "%...~~~~~...%",
    "%.#.~...~.#.%",
    "%...~...~...%",
    "%.T.......T.%",
    "%...........%",
    "%.T.......T.%",
    "%...I...I...%",
    "%.#.......#.%",
    "%...........%",
    "%P..#####..I%",
    "%....##B##..%",
  ],
  [
    "%%%%%%%%%%%%%",
    "%S.#..S.#..S%",
    "%...........%",
    "%.%.%.%.%.%.%",
    "%...........%",
    "%I.........I%",
    "%...........%",
    "%.#.#...#.#.%",
    "%...........%",
    "%.T.......T.%",
    "%...........%",
    "%P..#####..I%",
    "%....##B##..%",
  ],
];
