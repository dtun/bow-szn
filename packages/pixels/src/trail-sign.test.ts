import { SPRITES } from "./index.ts";

describe("sign points", () => {
  it("mirror each other, so a BACK sign and a HUNT! sign match", () => {
    let mirrored = SPRITES["sign-point-right"].rows.map((row) => [...row].reverse().join(""));

    expect(SPRITES["sign-point-left"].rows).toEqual(mirrored);
  });

  it("narrow to a single outline pixel at the top and bottom, so they meet a board's edges", () => {
    let { rows, h } = SPRITES["sign-point-right"];

    expect([rows[0].replaceAll(".", ""), rows[h - 1].replaceAll(".", "")]).toEqual(["U", "U"]);
  });

  it("reach their tip on the middle row, the full width of the sprite", () => {
    let { rows, w, h } = SPRITES["sign-point-right"];

    expect(h % 2).toBe(1);
    expect(rows[Math.floor(h / 2)]).toBe(`${"B".repeat(w - 1)}U`);
  });

  it("are 13 pixels tall, the height of a sign board", () => {
    expect(SPRITES["sign-point-left"].h).toBe(13);
    expect(SPRITES["sign-point-right"].h).toBe(13);
  });
});

describe("sign hardware", () => {
  it("draws a square nail head lit from the top left", () => {
    expect(SPRITES["sign-nail"].rows).toEqual(["HHh", "Hhh", "hhh"]);
  });

  it("draws a wood knot in the board's own browns", () => {
    expect(SPRITES["sign-knot"].rows.join("").replaceAll(".", "")).toMatch(/^[UBb]+$/);
  });
});
