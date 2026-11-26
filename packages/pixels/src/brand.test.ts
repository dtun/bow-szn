import {
  adaptiveBackgroundScene,
  adaptiveForegroundScene,
  faviconScene,
  iconScene,
  splashScene,
} from "./brand.ts";
import { PALETTE, TRANSPARENT } from "./index.ts";
import type { Sprite } from "./index.ts";

const OPAQUE_SCENES: [string, Sprite, number][] = [
  ["icon", iconScene(), 32],
  ["adaptive background", adaptiveBackgroundScene(), 32],
  ["favicon", faviconScene(), 16],
  ["splash", splashScene(), 64],
];

function paintedCells(scene: Sprite): [number, number][] {
  return scene.rows.flatMap((row, y) =>
    [...row].flatMap((cell, x) => (cell === TRANSPARENT ? [] : ([[x, y]] as [number, number][])))
  );
}

describe.each(OPAQUE_SCENES)("%s scene", (_name, scene, size) => {
  it("is a square grid of the planned size", () => {
    expect([scene.w, scene.h]).toEqual([size, size]);
    expect(scene.rows.every((row) => row.length === size)).toBe(true);
  });

  it("paints every cell so no alpha is needed", () => {
    expect(paintedCells(scene)).toHaveLength(size * size);
  });

  it("uses only palette colors", () => {
    let strays = [...new Set(scene.rows.join(""))].filter((cell) => !(cell in PALETTE));

    expect(strays).toEqual([]);
  });
});

describe("adaptive foreground scene", () => {
  let scene = adaptiveForegroundScene();

  it("is a 32 cell grid with clear corners so the background shows", () => {
    expect([scene.w, scene.h]).toEqual([32, 32]);
    for (let [x, y] of [
      [0, 0],
      [31, 0],
      [0, 31],
      [31, 31],
    ]) {
      expect(scene.rows[y][x]).toBe(TRANSPARENT);
    }
  });

  it("keeps every painted cell inside the 66 of 108 safe circle", () => {
    let safeRadius = (32 * 66) / 108 / 2;
    let cells = paintedCells(scene);

    expect(cells.length).toBeGreaterThan(0);
    for (let [x, y] of cells) {
      expect(Math.hypot(x + 0.5 - 16, y + 0.5 - 16)).toBeLessThanOrEqual(safeRadius);
    }
  });
});

describe("splash scene", () => {
  let scene = splashScene();

  it("sits on the splash color in every corner", () => {
    for (let [x, y] of [
      [0, 0],
      [63, 0],
      [0, 63],
      [63, 63],
    ]) {
      expect(scene.rows[y][x]).toBe("S");
    }
  });

  it("centers the logo horizontally", () => {
    let logoColumns = scene.rows.flatMap((row) =>
      [...row].flatMap((cell, x) => (cell === "S" ? [] : [x]))
    );
    let left = Math.min(...logoColumns);
    let right = 63 - Math.max(...logoColumns);

    expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
  });
});
