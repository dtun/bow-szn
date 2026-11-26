import { SPRITES, TRANSPARENT } from "./index.ts";

const MAX_RAGGED_INSET = 2;

function colorsIn(id: keyof typeof SPRITES): string {
  return [...new Set(SPRITES[id].rows.join("").replaceAll(TRANSPARENT, ""))].sort().join("");
}

describe("bale-target", () => {
  it("is 80 by 44 pixels so the sway path has room across it", () => {
    expect([SPRITES["bale-target"].w, SPRITES["bale-target"].h]).toEqual([80, 44]);
  });

  it("is straw and twine only, so the gold face is the one bright thing on it", () => {
    expect(colorsIn("bale-target")).toBe("BLTUt");
  });

  it("is ragged at the edges and solid through the middle", () => {
    let rows = SPRITES["bale-target"].rows;

    expect(rows[0]).toContain(TRANSPARENT);
    expect(rows[22].slice(4, 76)).not.toContain(TRANSPARENT);
  });

  it("is bound by two twine bands that run from edge to edge", () => {
    let body = SPRITES["bale-target"].rows.slice(MAX_RAGGED_INSET, -MAX_RAGGED_INSET);
    let bandColumns = [18, 19, 60, 61];

    for (let column of bandColumns) {
      expect(body.filter((row) => "UB".includes(row[column]))).toHaveLength(body.length);
    }
  });
});

describe("bale-arrow", () => {
  it("enters the bale at its bottom center, under the shaft", () => {
    let { rows, w, h } = SPRITES["bale-arrow"];

    expect(rows[h - 1][Math.floor(w / 2)]).toBe("E");
    expect(rows[h - 2][Math.floor(w / 2)]).toBe("C");
  });

  it("wears red fletching at the far end of the shaft", () => {
    let { rows } = SPRITES["bale-arrow"];

    expect(rows.slice(0, 4).join("")).toContain("R");
    expect(rows.slice(4).join("")).not.toContain("R");
  });
});

describe("sight-pin", () => {
  it("has a red center pixel, so the player aims with the middle of the pin", () => {
    let { rows, w, h } = SPRITES["sight-pin"];

    expect([w % 2, h % 2]).toEqual([1, 1]);
    expect(rows[Math.floor(h / 2)][Math.floor(w / 2)]).toBe("R");
  });

  it("is outlined dark, so it shows on gold, red, and straw alike", () => {
    let { rows } = SPRITES["sight-pin"];

    expect(rows[0].replaceAll(TRANSPARENT, "")).toBe("KKK");
  });
});
