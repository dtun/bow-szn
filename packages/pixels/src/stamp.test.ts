import { SPRITES, TRANSPARENT } from "./index.ts";

describe("stamp-frame", () => {
  it("is 30 by 16 pixels, wide enough for SEASON: with room around it", () => {
    expect([SPRITES["stamp-frame"].w, SPRITES["stamp-frame"].h]).toEqual([30, 16]);
  });

  it("is a single ink, like an impression from one pad", () => {
    expect(new Set(SPRITES["stamp-frame"].rows.join("").replaceAll(TRANSPARENT, ""))).toEqual(
      new Set("M")
    );
  });

  it("notches its four corners", () => {
    let { rows, w, h } = SPRITES["stamp-frame"];

    expect([rows[0][0], rows[0][w - 1], rows[h - 1][0], rows[h - 1][w - 1]]).toEqual([
      TRANSPARENT,
      TRANSPARENT,
      TRANSPARENT,
      TRANSPARENT,
    ]);
  });

  it("rules a double border: an outer line, a gap, and an inner line", () => {
    let { rows, w } = SPRITES["stamp-frame"];
    let middleRow = rows[8];

    expect(middleRow[0]).toBe("M");
    expect(middleRow[1]).toBe(TRANSPARENT);
    expect(middleRow[2]).toBe("M");
    expect(middleRow[w - 3]).toBe("M");
    expect(middleRow[w - 2]).toBe(TRANSPARENT);
    expect(middleRow[w - 1]).toBe("M");
  });

  it("leaves the inside empty for the season's name", () => {
    let inside = SPRITES["stamp-frame"].rows.slice(3, 13).map((row) => row.slice(3, 27));

    expect(inside.every((row) => row === TRANSPARENT.repeat(24))).toBe(true);
  });

  it("wears a little: some of the border never took ink", () => {
    let rows = SPRITES["stamp-frame"].rows;
    let outerTop = rows[0].slice(1, 29);

    expect(rows[8][0] + rows[8][29] + outerTop).toContain(TRANSPARENT);
  });
});
