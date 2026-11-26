import { ANIMAL_FRAMES, SPRITES } from "./index.ts";
import type { AnimalKind, Sprite } from "./index.ts";

function antlerPixels(sprite: Sprite): number {
  return sprite.rows.join("").replace(/[^Aa]/g, "").length;
}

function firstWalkFrame(kind: AnimalKind): Sprite {
  return SPRITES[ANIMAL_FRAMES[kind].walk[0]];
}

describe("elk sprites", () => {
  it("gives cows no antler pixels in any pose", () => {
    let { walk, graze, flee, down } = ANIMAL_FRAMES["elk-cow"];

    for (let id of [...walk, graze, flee, down]) {
      expect(antlerPixels(SPRITES[id])).toBe(0);
    }
  });

  it("gives bulls a rack in every pose", () => {
    let { walk, graze, flee, down } = ANIMAL_FRAMES["elk-bull"];

    for (let id of [...walk, graze, flee, down]) {
      expect(antlerPixels(SPRITES[id])).toBeGreaterThan(0);
    }
  });

  it("grows the bull's rack past the biggest whitetail rack", () => {
    expect(antlerPixels(firstWalkFrame("elk-bull"))).toBeGreaterThan(
      antlerPixels(firstWalkFrame("buck-large"))
    );
  });

  it("draws an elk longer than a deer", () => {
    expect(firstWalkFrame("elk-cow").w).toBeGreaterThan(firstWalkFrame("doe").w);
  });
});
