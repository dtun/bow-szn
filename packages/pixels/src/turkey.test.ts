import { ANIMAL_FRAMES, SPRITES } from "./index.ts";

describe("turkey sprites", () => {
  it("shows the red wattle and the blue head in every pose", () => {
    let { walk, graze, flee, down } = ANIMAL_FRAMES.turkey;

    for (let id of [...walk, graze, flee, down]) {
      let pixels = SPRITES[id].rows.join("");

      expect(pixels).toContain("R");
      expect(pixels).toContain("Z");
    }
  });

  it("gives the turkey no antler pixels", () => {
    let { walk, graze, flee, down } = ANIMAL_FRAMES.turkey;

    for (let id of [...walk, graze, flee, down]) {
      expect(SPRITES[id].rows.join("")).not.toMatch(/[Aa]/);
    }
  });
});
