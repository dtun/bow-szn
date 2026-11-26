import { SPRITES } from "@bow-szn/pixels";

import { colorAt } from "@/art/test-support/color-at";

import { dawnScene, type DawnScene } from "./dawn-scene";
import { titleAmbience } from "./title-ambience";

const SKY_BLUE = "#2b6cd9";
const SUN_YELLOW = "#f7d44a";
const FIELD_GREEN = "#2d6b24";
const PLANK_BROWN = "#b8854a";
const PHONE = { cols: 98, rows: 113 };
const SMALL_PHONE = { cols: 60, rows: 80 };

function paintedAt(scene: DawnScene, x: number, y: number): string | null {
  return colorAt(scene.layers, x, y);
}

function allSprites(scene: DawnScene) {
  return scene.layers.flatMap((layer) => layer.sprites);
}

test("the sky starts blue at the top corner and the field ends green at the bottom corner", () => {
  let scene = dawnScene(PHONE.cols, PHONE.rows);

  expect(paintedAt(scene, 0, 0)).toBe(SKY_BLUE);
  expect(paintedAt(scene, PHONE.cols - 1, PHONE.rows - 1)).toBe(FIELD_GREEN);
});

test("the sun rises to the right of center, clear of the hills and the treeline", () => {
  let scene = dawnScene(PHONE.cols, PHONE.rows);
  let sunColumn = Math.round(PHONE.cols * 0.68);

  expect(paintedAt(scene, sunColumn, scene.horizonRow - 12)).toBe(SUN_YELLOW);
});

test("the deer grazes in the field, below the horizon and inside the picture", () => {
  let scene = dawnScene(PHONE.cols, PHONE.rows);
  let atRest = scene.ambient(titleAmbience(0, 1, PHONE.cols));
  let doe = atRest.sprites.find((placed) => placed.sprite === SPRITES["doe-graze"]);

  expect(doe?.y).toBeGreaterThan(scene.horizonRow);
  expect((doe?.y ?? 0) + SPRITES["doe-graze"].h).toBeLessThanOrEqual(PHONE.rows);
});

test("the hunter stands on the stand's plank", () => {
  let scene = dawnScene(PHONE.cols, PHONE.rows);
  let hunter = allSprites(scene).find((placed) => placed.sprite.name === "title-hunter");
  let planks = scene.layers
    .flatMap((layer) => layer.rects)
    .filter((rect) => rect.color === PLANK_BROWN);

  expect(planks.map((plank) => plank.y)).toContain((hunter?.y ?? 0) + (hunter?.sprite.h ?? 0));
});

test.each([PHONE, SMALL_PHONE])("every flat shape fits inside a $cols by $rows picture", (size) => {
  let scene = dawnScene(size.cols, size.rows);
  let rects = scene.layers.flatMap((layer) => layer.rects);

  for (let rect of rects) {
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.y).toBeGreaterThanOrEqual(0);
    expect(rect.x + rect.width).toBeLessThanOrEqual(size.cols);
    expect(rect.y + rect.height).toBeLessThanOrEqual(size.rows);
  }
});
