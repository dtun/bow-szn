import { PALETTE } from "@bow-szn/pixels";

import { PLANK_WIDTH, SEAM_WIDTH, plankRects } from "./wall-planks";

const WIDTH = 390;
const HEIGHT = 800;

test("the planks reach across the whole width with a seam in front of each one", () => {
  let rects = plankRects(WIDTH, HEIGHT);
  let planks = rects.filter((rect) => rect.key.startsWith("plank-"));
  let seams = rects.filter((rect) => rect.key.startsWith("seam-"));

  expect(planks).toHaveLength(13);
  expect(planks.map((rect) => rect.x)).toEqual(
    Array.from({ length: 13 }, (_, index) => index * PLANK_WIDTH)
  );
  expect(Math.max(...planks.map((rect) => rect.x + rect.width))).toBeGreaterThanOrEqual(WIDTH);
  expect(seams.map((rect) => rect.x)).toEqual(planks.map((rect) => rect.x));
  expect(seams.every((rect) => rect.color === PALETTE.E && rect.width === SEAM_WIDTH)).toBe(true);
});

test("every plank and seam runs the full height of the wall", () => {
  let rects = plankRects(WIDTH, HEIGHT).filter((rect) => !rect.key.startsWith("grain-"));

  expect(rects.every((rect) => rect.y === 0 && rect.height === HEIGHT)).toBe(true);
});

test("neighboring planks are not the same color", () => {
  let planks = plankRects(WIDTH, HEIGHT).filter((rect) => rect.key.startsWith("plank-"));

  for (let index = 1; index < planks.length; index++) {
    expect(planks[index].color).not.toBe(planks[index - 1].color);
  }
});

test("grain marks stay inside the wall and inside their own plank", () => {
  let grains = plankRects(WIDTH, HEIGHT).filter((rect) => rect.key.startsWith("grain-"));

  expect(grains).toHaveLength(13 * 5);
  for (let grain of grains) {
    let plank = Number(grain.key.split("-")[1]);
    expect(grain.x).toBeGreaterThanOrEqual(plank * PLANK_WIDTH + SEAM_WIDTH);
    expect(grain.x + grain.width).toBeLessThanOrEqual((plank + 1) * PLANK_WIDTH);
    expect(grain.y + grain.height).toBeLessThanOrEqual(HEIGHT);
  }
});

test("the same wall is drawn every time", () => {
  expect(plankRects(WIDTH, HEIGHT)).toEqual(plankRects(WIDTH, HEIGHT));
});
