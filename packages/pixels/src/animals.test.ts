import { ANIMAL_FRAMES, SPRITES } from "./index.ts";
import type { AnimalKind, SpriteId } from "./index.ts";

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

function pixelsOf(id: SpriteId, chars: string): number {
  return SPRITES[id].rows
    .join("")
    .split("")
    .filter((cell) => chars.includes(cell)).length;
}

describe.each(KINDS)("%s frames", (kind) => {
  it("keeps every pose the same width so the anchor never jumps", () => {
    let { walk, graze, flee, down } = ANIMAL_FRAMES[kind];

    expect(new Set([...walk, graze, flee, down].map((id) => SPRITES[id].w)).size).toBe(1);
  });

  it("names a down pose after its kind", () => {
    expect(SPRITES[ANIMAL_FRAMES[kind].down].name).toBe(`${kind}-down`);
  });

  it("lays the animal lower than it stands", () => {
    let { walk, down } = ANIMAL_FRAMES[kind];

    expect(SPRITES[down].h).toBeLessThan(SPRITES[walk[0]].h);
  });

  it("paints no more red when it is down than when it stands", () => {
    let { walk, down } = ANIMAL_FRAMES[kind];

    expect(pixelsOf(down, "RM")).toBeLessThanOrEqual(pixelsOf(walk[0], "RM"));
  });

  it("alternates the legs between the two walking frames", () => {
    let [first, second] = ANIMAL_FRAMES[kind].walk;

    expect(SPRITES[first].rows).not.toEqual(SPRITES[second].rows);
  });
});
