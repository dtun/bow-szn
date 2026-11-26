import { SPRITES } from "./index.ts";

const LETTER_IDS = ["logo-b", "logo-o", "logo-w", "logo-s", "logo-e", "logo-a", "logo-n"] as const;

const LETTER_W = 7;
const LETTER_H = 9;
const LETTERS_IN_WORDMARK = 9;
const LETTER_GAPS = 7;
const WORD_GAP = 5;
const SHADOW = 1;

describe("logo sprites", () => {
  it("draws every letter on the same grid", () => {
    for (let id of LETTER_IDS) {
      expect([SPRITES[id].w, SPRITES[id].h]).toEqual([LETTER_W, LETTER_H]);
    }
  });

  it("sizes the wordmark to the nine letters, their gaps, and the shadow", () => {
    let wordmark = SPRITES["logo-wordmark"];

    expect(wordmark.w).toBe(LETTERS_IN_WORDMARK * LETTER_W + LETTER_GAPS + WORD_GAP + SHADOW);
    expect(wordmark.h).toBe(LETTER_H + SHADOW);
  });

  it("paints the wordmark in cream letters with a red shadow", () => {
    let colors = new Set(SPRITES["logo-wordmark"].rows.join("").replaceAll(".", ""));

    expect([...colors].sort()).toEqual(["C", "R"]);
  });
});
