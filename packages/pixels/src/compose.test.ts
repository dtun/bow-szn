import { blank, defineSprites, hstack, overlay, recolor, shadowed, sprite } from "./compose.ts";

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

describe("blank", () => {
  it("fills a w by h canvas with transparency by default", () => {
    expect(blank("empty", 3, 2)).toEqual({ name: "empty", w: 3, h: 2, rows: ["...", "..."] });
  });

  it("fills the canvas with the given color", () => {
    expect(blank("wall", 2, 2, "S").rows).toEqual(["SS", "SS"]);
  });
});

describe("recolor", () => {
  it("paints every opaque cell one color and leaves the clear cells", () => {
    expect(recolor("flat", sprite("mix", ["AB.", ".CD"]), "K").rows).toEqual(["KK.", ".KK"]);
  });
});

describe("hstack", () => {
  it("lines the parts up left to right with the gap between them", () => {
    let result = hstack("row", [sprite("one", ["AA", "AA"]), sprite("two", ["B"])], 2);

    expect(result.rows).toEqual(["AA..B", "AA..."]);
  });

  it("pads a shorter part with clear rows below it", () => {
    let result = hstack("row", [sprite("short", ["A"]), sprite("tall", ["B", "B", "B"])], 0);

    expect(result.rows).toEqual(["AB", ".B", ".B"]);
  });
});

describe("shadowed", () => {
  it("drops a one-pixel shadow down and to the right and keeps the source on top", () => {
    let result = shadowed("lit", sprite("dot", ["AA", "AA"]), "K");

    expect(result.rows).toEqual(["AA.", "AAK", ".KK"]);
  });
});
