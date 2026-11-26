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

function distanceFromCenter(scene: Sprite, x: number, y: number): number {
  let center = (scene.w - 1) / 2;
  return Math.hypot(x - center, y - center);
}

function colorsOf(scene: Sprite): string[] {
  return [...new Set(scene.rows.join("").replaceAll(TRANSPARENT, ""))].sort();
}

function buckCells(scene: Sprite): [number, number][] {
  return paintedCells(scene).filter(
    ([x, y]) => scene.rows[y][x] === "N" && distanceFromCenter(scene, x, y) < scene.w / 2 - 0.5
  );
}

describe("icon scene", () => {
  let scene = iconScene();
  let buck = buckCells(scene);

  it("is a navy buck on a dawn orange sun over a navy field, and nothing else", () => {
    expect(colorsOf(scene)).toEqual(["N", "O"]);
    for (let [x, y] of [
      [0, 0],
      [31, 0],
      [0, 31],
      [31, 31],
    ]) {
      expect(scene.rows[y][x]).toBe("N");
    }
  });

  it("stands the buck over most of the sun, from its antler tips down to its hooves", () => {
    let top = Math.min(...buck.map(([, y]) => y));
    let bottom = Math.max(...buck.map(([, y]) => y));

    expect(bottom - top + 1).toBeGreaterThanOrEqual(0.8 * 31);
  });

  it("keeps a ring of sun around the buck so it never merges with the navy field", () => {
    let ring = paintedCells(scene).filter(([x, y]) => {
      let distance = distanceFromCenter(scene, x, y);
      return distance > scene.w / 2 - 1.5 && distance <= scene.w / 2 - 0.5;
    });

    expect(ring.filter(([x, y]) => scene.rows[y][x] !== "O")).toEqual([]);
  });
});

describe("adaptive foreground scene", () => {
  let scene = adaptiveForegroundScene();

  it("is a 64 cell grid with clear corners so the background shows", () => {
    expect([scene.w, scene.h]).toEqual([64, 64]);
    for (let [x, y] of [
      [0, 0],
      [63, 0],
      [0, 63],
      [63, 63],
    ]) {
      expect(scene.rows[y][x]).toBe(TRANSPARENT);
    }
  });

  it("keeps every painted cell inside the 66 of 108 safe circle", () => {
    let safeRadius = (64 * 66) / 108 / 2;
    let cells = paintedCells(scene);

    expect(cells.length).toBeGreaterThan(0);
    for (let [x, y] of cells) {
      expect(Math.hypot(x + 0.5 - 32, y + 0.5 - 32)).toBeLessThanOrEqual(safeRadius);
    }
  });

  it("is the sun and the buck in the icon's two colors", () => {
    expect(colorsOf(scene)).toEqual(["N", "O"]);
  });
});

describe("adaptive background scene", () => {
  it("is flat navy", () => {
    expect(colorsOf(adaptiveBackgroundScene())).toEqual(["N"]);
  });
});

describe("favicon scene", () => {
  it("draws the buck and its sun in the icon's two colors", () => {
    expect(colorsOf(faviconScene())).toEqual(["N", "O"]);
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
