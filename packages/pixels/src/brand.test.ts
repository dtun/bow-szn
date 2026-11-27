import {
  ICON_BUCK_AT,
  adaptiveBackgroundScene,
  adaptiveForegroundScene,
  faviconScene,
  iconScene,
  splashScene,
} from "./brand.ts";
import { overlay } from "./compose.ts";
import { PALETTE, SPRITES, TRANSPARENT } from "./index.ts";
import type { Sprite } from "./index.ts";

const OPAQUE_SCENES: [string, Sprite, number][] = [
  ["icon", iconScene(), 64],
  ["adaptive background", adaptiveBackgroundScene(), 64],
  ["favicon", faviconScene(), 16],
  ["splash", splashScene(), 128],
];

const MASK_CORNER_SHARE = 0.2237;
const SAFE_MARGIN = 4;
const SUN_COLORS = ["u", "Y"];

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

function insideRoundedSquare(px: number, py: number, size: number, inset: number): boolean {
  let radius = MASK_CORNER_SHARE * size - inset;
  let low = inset + radius;
  let high = size - inset - radius;
  let dx = Math.max(low - px, px - high, 0);
  let dy = Math.max(low - py, py - high, 0);
  return px >= inset && px <= size - inset && py >= inset && py <= size - inset
    ? dx * dx + dy * dy <= radius * radius
    : false;
}

describe("icon scene", () => {
  let scene = iconScene();
  let buck = SPRITES["brand-icon-buck"];
  let buckCells = paintedCells(buck).map(([x, y]) => [x + ICON_BUCK_AT.x, y + ICON_BUCK_AT.y]);

  it("draws every cell of the buck where it stands", () => {
    let drawn = paintedCells(buck).map(
      ([x, y]) => scene.rows[y + ICON_BUCK_AT.y][x + ICON_BUCK_AT.x]
    );

    expect(drawn.join("")).toBe(buck.rows.join("").replaceAll(TRANSPARENT, ""));
  });

  it("keeps the whole buck four cells inside the rounded square iOS masks the icon to", () => {
    let outside = buckCells.filter(
      ([x, y]) =>
        ![
          [x, y],
          [x + 1, y],
          [x, y + 1],
          [x + 1, y + 1],
        ].every(([cx, cy]) => insideRoundedSquare(cx, cy, scene.w, SAFE_MARGIN))
    );

    expect(outside).toEqual([]);
  });

  it("backs every gap in the rack with the sun so the tines read at home-screen size", () => {
    let rackRows = buck.rows.slice(0, 8);
    let gaps = rackRows.flatMap((row, y) => {
      let first = row.search(/[^.]/);
      let last = row.length - 1 - [...row].reverse().join("").search(/[^.]/);
      return [...row].flatMap((cell, x) =>
        cell === TRANSPARENT && x > first && x < last
          ? [scene.rows[y + ICON_BUCK_AT.y][x + ICON_BUCK_AT.x]]
          : []
      );
    });

    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps.filter((cell) => !SUN_COLORS.includes(cell))).toEqual([]);
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

  it("stacks on the adaptive background into exactly the icon", () => {
    let stacked = overlay("stacked", adaptiveBackgroundScene(), scene, 0, 0);

    expect(stacked.rows).toEqual(iconScene().rows);
  });

  it("keeps the buck inside the 72 of 108 square that every launcher mask shows", () => {
    let low = (64 * 18) / 108;
    let high = (64 * 90) / 108;
    let cells = paintedCells(scene);

    expect(cells.length).toBeGreaterThan(0);
    expect(cells.filter(([x, y]) => x < low || x + 1 > high || y < low || y + 1 > high)).toEqual(
      []
    );
  });
});

describe("favicon scene", () => {
  it("sets the mini buck against the sun at the same dawn", () => {
    let scene = faviconScene();
    let colors = new Set(scene.rows.join(""));

    expect(["N", "K", "u", "Y", "O"].every((color) => colors.has(color))).toBe(true);
  });
});

describe("splash scene", () => {
  let scene = splashScene();

  it("sits on the splash color in every corner", () => {
    for (let [x, y] of [
      [0, 0],
      [127, 0],
      [0, 127],
      [127, 127],
    ]) {
      expect(scene.rows[y][x]).toBe("S");
    }
  });

  it("centers the logo horizontally", () => {
    let logoColumns = scene.rows.flatMap((row) =>
      [...row].flatMap((cell, x) => (cell === "S" ? [] : [x]))
    );
    let left = Math.min(...logoColumns);
    let right = 127 - Math.max(...logoColumns);

    expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
  });

  it("crops the icon into the badge so the buck at dawn greets the player", () => {
    let icon = iconScene();
    let badgeCenter = scene.rows[6 + 1 + 32].slice(32, 32 + 64);

    expect(badgeCenter).toBe(icon.rows[32]);
  });
});
