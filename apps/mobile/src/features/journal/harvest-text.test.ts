import type { Harvest } from "@bow-szn/core";

import { entryTitle, formatClock } from "./harvest-text";
import { BIG_BUCK, BULL_ELK, DOE, RABBIT, TURKEY } from "./test-support/harvests";

test.each([
  [0, "12:00 AM"],
  [360, "6:00 AM"],
  [462, "7:42 AM"],
  [599, "9:59 AM"],
  [600, "10:00 AM"],
  [720, "12:00 PM"],
  [725, "12:05 PM"],
  [785, "1:05 PM"],
  [1439, "11:59 PM"],
])("minute %i of the day reads %s", (clockMin, expected) => {
  expect(formatClock(clockMin)).toBe(expected);
});

const SPIKE: Harvest = { ...DOE, id: "spike", antlers: { kind: "spike" } };
const COW: Harvest = { ...BULL_ELK, id: "cow", antlers: { kind: "none" } };

test.each([
  ["a whitetail rack counts its points", BIG_BUCK, "10 PT BUCK"],
  ["an elk rack makes a bull", BULL_ELK, "14 PT BULL"],
  ["a spike is a spike", SPIKE, "SPIKE"],
  ["a whitetail with no antlers is a doe", DOE, "DOE"],
  ["an elk with no antlers is a cow", COW, "COW"],
  ["a turkey is a turkey", TURKEY, "TURKEY"],
  ["a rabbit is a rabbit", RABBIT, "RABBIT"],
])("%s", (_name, harvest, expected) => {
  expect(entryTitle(harvest)).toBe(expected);
});
