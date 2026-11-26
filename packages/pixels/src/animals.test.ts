import { ANIMAL_FRAMES, SPRITES } from "./index.ts";
import type { AnimalKind } from "./index.ts";

const KINDS = Object.keys(ANIMAL_FRAMES) as AnimalKind[];

describe.each(KINDS)("%s frames", (kind) => {
  it("keeps every pose the same width so the anchor never jumps", () => {
    let { walk, graze, flee } = ANIMAL_FRAMES[kind];

    expect(new Set([...walk, graze, flee].map((id) => SPRITES[id].w)).size).toBe(1);
  });

  it("alternates the legs between the two walking frames", () => {
    let [first, second] = ANIMAL_FRAMES[kind].walk;

    expect(SPRITES[first].rows).not.toEqual(SPRITES[second].rows);
  });
});
