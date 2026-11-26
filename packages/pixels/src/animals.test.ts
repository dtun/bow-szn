import { ANIMAL_FRAMES, SPRITES } from "./index.ts";
import type { AnimalKind } from "./index.ts";

const KINDS = Object.keys(ANIMAL_FRAMES) as AnimalKind[];

function widthOf(kind: AnimalKind): number {
  return SPRITES[ANIMAL_FRAMES[kind].walk[0]].w;
}

describe("animal sizes", () => {
  it("draws species in the order of their hit radius: rabbit, turkey, whitetail, elk", () => {
    expect(widthOf("rabbit")).toBeLessThan(widthOf("turkey"));
    expect(widthOf("turkey")).toBeLessThan(widthOf("doe"));
    expect(widthOf("doe")).toBeLessThan(widthOf("elk-cow"));
  });
});

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
