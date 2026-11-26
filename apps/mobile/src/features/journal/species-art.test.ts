import { PALETTE } from "@bow-szn/pixels";

import { spriteRuns } from "@/art/sprite-runs";

import { SPECIES_ORDER, speciesScale, speciesSprite } from "./species-art";

test("every species has a card, and none is listed twice", () => {
  expect([...SPECIES_ORDER].sort()).toEqual(["elk", "rabbit", "turkey", "whitetail"]);
});

test("a locked species is one flat color with the same outline as the unlocked art", () => {
  for (let species of SPECIES_ORDER) {
    let open = speciesSprite(species, true);
    let locked = speciesSprite(species, false);

    expect({ w: locked.w, h: locked.h }).toEqual({ w: open.w, h: open.h });
    expect(new Set(spriteRuns(locked).map((run) => run.color))).toEqual(new Set([PALETTE.h]));
    expect(locked.rows.map((row) => row.replace(/[^.]/g, "x"))).toEqual(
      open.rows.map((row) => row.replace(/[^.]/g, "x"))
    );
  }
});

test("an unlocked species keeps its colors", () => {
  let colors = new Set(spriteRuns(speciesSprite("whitetail", true)).map((run) => run.color));

  expect(colors.size).toBeGreaterThan(2);
});

test("each species art scales to a whole number of pixels near the same card width", () => {
  expect(SPECIES_ORDER.map(speciesScale)).toEqual([5, 4, 6, 6]);
});
