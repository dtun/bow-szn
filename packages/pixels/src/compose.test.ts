import { defineSprites, overlay, sprite } from "./compose.ts";

describe("sprite", () => {
  it("measures the grid from its rows", () => {
    expect(sprite("box", ["AB.", "..C"])).toEqual({
      name: "box",
      w: 3,
      h: 2,
      rows: ["AB.", "..C"],
    });
  });
});

describe("defineSprites", () => {
  it("names each sprite by its key", () => {
    let sprites = defineSprites({ one: ["A"], two: ["BB", "BB"] });

    expect(sprites.one).toEqual({ name: "one", w: 1, h: 1, rows: ["A"] });
    expect(sprites.two).toEqual({ name: "two", w: 2, h: 2, rows: ["BB", "BB"] });
  });
});

describe("overlay", () => {
  let base = sprite("base", ["AAA", "AAA", "AAA"]);

  it("paints the top sprite over the base at the offset", () => {
    let result = overlay("both", base, sprite("dot", ["B"]), 1, 2);

    expect(result).toEqual({ name: "both", w: 3, h: 3, rows: ["AAA", "AAA", "ABA"] });
  });

  it("lets the base show through transparent cells of the top", () => {
    let result = overlay("both", base, sprite("ring", ["B.B"]), 0, 0);

    expect(result.rows).toEqual(["BAB", "AAA", "AAA"]);
  });

  it("grows the canvas upward and keeps the base on the bottom rows", () => {
    let result = overlay("tall", base, sprite("tine", ["B", "B"]), 1, -2);

    expect(result.rows).toEqual([".B.", ".B.", "AAA", "AAA", "AAA"]);
  });

  it("grows the canvas leftward and keeps the base on the right columns", () => {
    let result = overlay("wide", base, sprite("tip", ["BB"]), -2, 1);

    expect(result.rows).toEqual(["..AAA", "BBAAA", "..AAA"]);
  });

  it("grows the canvas rightward past the base", () => {
    let result = overlay("long", base, sprite("tip", ["B"]), 4, 0);

    expect(result.rows).toEqual(["AAA.B", "AAA..", "AAA.."]);
  });
});
