import { ANIMAL_FRAMES, SPRITES } from "./index.ts";
import type { AnimalKind, Sprite } from "./index.ts";

const RACKED_KINDS: AnimalKind[] = ["spike", "buck-small", "buck-medium", "buck-large", "elk-bull"];

const WHITETAIL_RACKS: AnimalKind[] = ["spike", "buck-small", "buck-medium", "buck-large"];

function antlerCells(sprite: Sprite): [number, number][] {
  return sprite.rows.flatMap((row, y) =>
    [...row].flatMap((cell, x) =>
      cell === "A" || cell === "a" ? [[x, y] as [number, number]] : []
    )
  );
}

function grazing(kind: AnimalKind): Sprite {
  return SPRITES[ANIMAL_FRAMES[kind].graze];
}

describe.each(RACKED_KINDS)("%s grazing", (kind) => {
  it("roots the rack on the lowered head at the front of the animal, not over its back", () => {
    let sprite = grazing(kind);
    let cells = antlerCells(sprite);
    let lowest = Math.max(...cells.map(([, y]) => y));
    let roots = cells.filter(([, y]) => y === lowest).map(([x]) => x);

    expect(Math.min(...roots)).toBeGreaterThanOrEqual(0.75 * sprite.w);
  });
});

describe("whitetail racks grazing", () => {
  it("grow from spike to small to medium to large", () => {
    let sizes = WHITETAIL_RACKS.map((kind) => antlerCells(grazing(kind)).length);

    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    expect(new Set(sizes).size).toBe(sizes.length);
  });
});
