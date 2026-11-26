import { colorAt } from "@/art/test-support/color-at";

import {
  HEADING_HEIGHT,
  PLATE_HEIGHT,
  PLATE_MAX_WIDTH,
  prepLayout,
  sightCell,
  type Screen,
} from "./prep-layout";
import { SIGHT_COLS, SIGHT_ROWS, sightBackdrop } from "./sight-scene";

const SKY = ["#2b6cd9", "#4aa8e0", "#8cc4f4", "#f9bb7c", "#f08a4b"];
const GRASS = ["#5fae3a", "#3e8e2f", "#2d6b24"];
const SIGN_ROW_REACH = 60;

type Phone = { name: string; screen: Screen; pixelRatio: number };

const PHONES: Phone[] = [
  {
    name: "a 6.9 inch phone",
    screen: { width: 440, height: 956, insetTop: 62, insetBottom: 34 },
    pixelRatio: 3,
  },
  {
    name: "a 6.3 inch phone",
    screen: { width: 402, height: 874, insetTop: 62, insetBottom: 34 },
    pixelRatio: 3,
  },
  {
    name: "a 6.1 inch phone",
    screen: { width: 390, height: 844, insetTop: 47, insetBottom: 34 },
    pixelRatio: 3,
  },
  {
    name: "a small phone with a home button",
    screen: { width: 375, height: 667, insetTop: 20, insetBottom: 0 },
    pixelRatio: 2,
  },
];

function paintedAcross(phone: Phone, fromPt: number, toPt: number): (string | null)[] {
  let layout = prepLayout(phone.screen, phone.pixelRatio);
  let layers = sightBackdrop(layout.cols, layout.rows, layout.horizonRow, layout.groundRow);
  let colors: (string | null)[] = [];
  for (let row = Math.floor(fromPt / layout.cell); row < Math.ceil(toPt / layout.cell); row++) {
    for (let column = 0; column < layout.cols; column++) {
      colors.push(colorAt(layers, column, row));
    }
  }
  return colors;
}

describe("the bale's cell", () => {
  test.each([
    [440, 3, 16 / 3],
    [402, 3, 5],
    [390, 3, 14 / 3],
    [375, 2, 4.5],
    [320, 2, 4],
  ])(
    "on a %d point wide screen at %dx is the biggest whole-pixel cell that fits",
    (width, ratio, cell) => {
      expect(sightCell(width, ratio)).toBeCloseTo(cell);
    }
  );

  test("never drops under three points", () => {
    expect(sightCell(100, 1)).toBe(3);
  });

  test("lands every cell on a whole device pixel", () => {
    for (let width of [320, 375, 390, 402, 430, 440]) {
      expect(sightCell(width, 3) * 3).toBeCloseTo(Math.round(sightCell(width, 3) * 3));
    }
  });
});

describe.each(PHONES)("on $name", (phone) => {
  let { screen, pixelRatio } = phone;
  let layout = prepLayout(screen, pixelRatio);
  let baleWidth = SIGHT_COLS * layout.cell;
  let baleHeight = SIGHT_ROWS * layout.cell;

  test("the bale spans nearly the whole width, centered, in whole device pixels", () => {
    expect(baleWidth / screen.width).toBeGreaterThan(0.9);
    expect(layout.baleLeft).toBeGreaterThanOrEqual(0);
    expect(layout.baleLeft + baleWidth).toBeLessThanOrEqual(screen.width);
    expect(Math.abs(screen.width - baleWidth - 2 * layout.baleLeft)).toBeLessThanOrEqual(
      1 / pixelRatio
    );
    expect(layout.cell * pixelRatio).toBeCloseTo(Math.round(layout.cell * pixelRatio));
  });

  test("the scene covers the whole screen", () => {
    expect(layout.cols * layout.cell).toBeGreaterThanOrEqual(screen.width);
    expect(layout.rows * layout.cell).toBeGreaterThanOrEqual(screen.height);
  });

  test("the heading sits under BACK and SKIP, and the message plate under the bale", () => {
    expect(layout.headingTop).toBeGreaterThanOrEqual(screen.insetTop + SIGN_ROW_REACH);
    expect(layout.headingTop + HEADING_HEIGHT).toBeLessThanOrEqual(layout.baleTop);
    expect(layout.plateTop).toBeGreaterThanOrEqual(layout.baleTop + baleHeight);
  });

  test("everything stays inside the safe area", () => {
    expect(layout.plateTop + PLATE_HEIGHT).toBeLessThanOrEqual(screen.height - screen.insetBottom);
    expect(PLATE_MAX_WIDTH).toBeLessThanOrEqual(screen.width);
  });

  test("BACK, SKIP, and the heading are on the sky, clear of the sun and the trees", () => {
    let onSky = paintedAcross(phone, 0, layout.headingTop + HEADING_HEIGHT);

    expect(onSky.filter((color) => !SKY.includes(color ?? ""))).toEqual([]);
  });

  test("the message plate and everything under it are on grass", () => {
    let onGrass = paintedAcross(phone, layout.plateTop, screen.height);

    expect(onGrass.filter((color) => !GRASS.includes(color ?? ""))).toEqual([]);
  });

  test("the horizon is above the bale, so the bale stands in the field", () => {
    expect(layout.horizonRow).toBeLessThan(layout.baleTop / layout.cell);
    expect(layout.groundRow).toBe(layout.baleTop / layout.cell + SIGHT_ROWS);
  });
});
