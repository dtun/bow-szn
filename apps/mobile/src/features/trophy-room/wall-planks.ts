import { PALETTE } from "@bow-szn/pixels";

export type WallRect = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export const PLANK_WIDTH = 32;
export const SEAM_WIDTH = 2;

const PLANK_COLORS = [PALETTE.B, "#7d5129", "#94622f"];
const GRAINS_PER_PLANK = 5;
const GRAIN_LENGTH = 12;
const GRAIN_HEIGHT = 2;

export function plankRects(width: number, height: number): WallRect[] {
  let rects: WallRect[] = [];
  let planks = Math.ceil(width / PLANK_WIDTH);
  for (let plank = 0; plank < planks; plank++) {
    let x = plank * PLANK_WIDTH;
    rects.push({
      key: `plank-${plank}`,
      x,
      y: 0,
      width: PLANK_WIDTH,
      height,
      color: PLANK_COLORS[plank % PLANK_COLORS.length],
    });
    rects.push({
      key: `seam-${plank}`,
      x,
      y: 0,
      width: SEAM_WIDTH,
      height,
      color: PALETTE.E,
    });
    for (let grain = 0; grain < GRAINS_PER_PLANK; grain++) {
      rects.push({
        key: `grain-${plank}-${grain}`,
        x: x + SEAM_WIDTH + ((plank * 7 + grain * 5) % (PLANK_WIDTH - SEAM_WIDTH - GRAIN_LENGTH)),
        y: ((plank + 1) * 53 * (grain + 1)) % Math.max(height - GRAIN_HEIGHT, 1),
        width: GRAIN_LENGTH,
        height: GRAIN_HEIGHT,
        color: PALETTE.U,
      });
    }
  }
  return rects;
}
