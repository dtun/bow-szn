const SCENE_CELLS_ACROSS = 90;
const MIN_CELL = 3;

export type Size = { width: number; height: number };
export type SceneGrid = { cell: number; cols: number; rows: number };

export function sceneGrid(size: Size): SceneGrid {
  let cell = Math.max(MIN_CELL, Math.floor(size.width / SCENE_CELLS_ACROSS));
  return { cell, cols: Math.ceil(size.width / cell), rows: Math.ceil(size.height / cell) };
}
