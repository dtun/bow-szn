import { LABEL_FONT, LABEL_GLYPH_H, LABEL_GLYPH_W } from "../scripts/label-font.ts";
import { SPRITES } from "./index.ts";

describe("LABEL_FONT", () => {
  it("draws every glyph on the same grid", () => {
    for (let [char, rows] of Object.entries(LABEL_FONT)) {
      expect([char, rows.length, new Set(rows.map((row) => row.length))]).toEqual([
        char,
        LABEL_GLYPH_H,
        new Set([LABEL_GLYPH_W]),
      ]);
    }
  });

  it("covers every character used in a sprite id so the contact sheet can label them", () => {
    let missing = new Set(
      Object.keys(SPRITES)
        .join("")
        .toUpperCase()
        .split("")
        .filter((char) => !(char in LABEL_FONT))
    );

    expect([...missing]).toEqual([]);
  });
});
