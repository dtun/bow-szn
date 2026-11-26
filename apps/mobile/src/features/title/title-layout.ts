const SCENE_CELLS_ACROSS = 90;
const MIN_CELL = 3;
const GRASS_ABOVE_MENU_ROWS = 26;
const MIN_SKY_ROWS = 30;

export type Size = { width: number; height: number };
export type SceneGrid = { cell: number; cols: number; rows: number };

export function sceneGrid(size: Size): SceneGrid {
  let cell = Math.max(MIN_CELL, Math.floor(size.width / SCENE_CELLS_ACROSS));
  return { cell, cols: Math.ceil(size.width / cell), rows: Math.ceil(size.height / cell) };
}

type HorizonInput = { rows: number; cell: number; menuHeight: number; skyTopRow: number };

export function horizonRowFor({ rows, cell, menuHeight, skyTopRow }: HorizonInput): number {
  let menuRows = Math.ceil(menuHeight / cell);
  return Math.max(skyTopRow + MIN_SKY_ROWS, rows - menuRows - GRASS_ABOVE_MENU_ROWS);
}
