import type { Harvest } from "@bow-szn/core";
import { SPRITES } from "@bow-szn/pixels";

import { BIG_BUCK, BULL_ELK } from "@/features/journal/test-support/harvests";

import { mountSprite } from "./mount-sprite";

function whitetailWithRack(points: number): Harvest {
  return { ...BIG_BUCK, antlers: { kind: "rack", points } };
}

test.each([
  [4, "mount-buck-small"],
  [6, "mount-buck-small"],
  [7, "mount-buck-medium"],
  [9, "mount-buck-medium"],
  [10, "mount-buck-large"],
  [12, "mount-buck-large"],
] as const)("a %i point whitetail hangs as %s", (points, sprite) => {
  expect(mountSprite(whitetailWithRack(points))).toBe(SPRITES[sprite]);
});

test("a bull elk hangs as the elk bull whatever its points", () => {
  expect(mountSprite(BULL_ELK)).toBe(SPRITES["mount-elk-bull"]);
});
