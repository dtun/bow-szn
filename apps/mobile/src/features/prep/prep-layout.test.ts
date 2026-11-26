import { sightCell } from "./prep-layout";

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
