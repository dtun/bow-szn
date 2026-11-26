import { SPRITES } from "./index.ts";

describe.each(["pushpin", "pushpin-picked"] as const)("%s", (id) => {
  it("ends in a one-pixel needle at its bottom center, where it marks the map", () => {
    let { rows, w, h } = SPRITES[id];

    expect(rows[h - 1].replaceAll(".", "")).toBe("h");
    expect(rows[h - 1].indexOf("h")).toBe(Math.floor(w / 2));
  });
});

describe("pushpin-picked", () => {
  it("is the same size as the idle pin, so choosing a spot never shifts it", () => {
    expect([SPRITES["pushpin-picked"].w, SPRITES["pushpin-picked"].h]).toEqual([
      SPRITES.pushpin.w,
      SPRITES.pushpin.h,
    ]);
  });

  it("has a red head, and the idle pin a blue one", () => {
    expect(SPRITES["pushpin-picked"].rows.join("")).toContain("R");
    expect(SPRITES.pushpin.rows.join("")).toContain("n");
    expect(SPRITES.pushpin.rows.join("")).not.toContain("R");
  });
});

describe("pencil-ring", () => {
  it("is wider than tall and has a center column, so it rings the needle tip", () => {
    let { w, h } = SPRITES["pencil-ring"];

    expect(w).toBeGreaterThan(h);
    expect(w % 2).toBe(1);
  });

  it("is hollow, so the paper and the pin show through", () => {
    let { rows, w, h } = SPRITES["pencil-ring"];

    expect(rows[Math.floor(h / 2)][Math.floor(w / 2)]).toBe(".");
  });
});

function colorsIn(id: keyof typeof SPRITES): string {
  return [...new Set(SPRITES[id].rows.join("").replaceAll(".", ""))].sort().join("");
}

describe("pencil sketches", () => {
  it.each(["pencil-ring", "pencil-clump", "pencil-tree", "pencil-peak", "pencil-house"] as const)(
    "%s is drawn in graphite only",
    (id) => {
      expect(colorsIn(id)).toMatch(/^H?h$/);
    }
  );

  it("draws the reeds in blue pencil with brown heads", () => {
    expect(colorsIn("pencil-reeds")).toBe("nt");
  });

  it.each(["pencil-clump", "pencil-tree"] as const)(
    "%s stands on a trunk at its bottom center",
    (id) => {
      let { rows, w, h } = SPRITES[id];

      expect(rows[h - 1].replaceAll(".", "")).toBe("h");
      expect(rows[h - 1].indexOf("h")).toBe(Math.floor(w / 2));
    }
  );

  it.each(["pencil-peak", "pencil-house"] as const)("%s sits on a solid ground line", (id) => {
    let { rows, w, h } = SPRITES[id];

    expect(rows[h - 1]).toBe("h".repeat(w));
  });
});
