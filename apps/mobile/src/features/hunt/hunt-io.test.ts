import type { Harvest } from "@bow-szn/core";
import * as Haptics from "expo-haptics";

import { deviceIo, fireEffects, type HuntIo } from "./hunt-io";

const DOE: Harvest = {
  id: "1-7",
  species: "whitetail",
  antlers: { kind: "none" },
  weightLb: 132,
  meatLb: 59,
  spot: "cedar-hollow",
  season: "early",
  clockMin: 381,
  shotYards: 41,
};

function fakeIo() {
  let io = { record: jest.fn(), play: jest.fn(), feel: jest.fn() } satisfies HuntIo;
  return io;
}

test("plays each sound, feels each haptic, and records each harvest, in order", () => {
  let io = fakeIo();

  fireEffects(
    [
      { kind: "sound", sound: "hit" },
      { kind: "sound", sound: "fanfare" },
      { kind: "haptic", haptic: "harvest" },
      { kind: "record", harvest: DOE },
    ],
    io
  );

  expect(io.play.mock.calls).toEqual([["hit"], ["fanfare"]]);
  expect(io.feel.mock.calls).toEqual([["harvest"]]);
  expect(io.record.mock.calls).toEqual([[DOE]]);
});

test("leaves the juice to the screen", () => {
  let io = fakeIo();

  fireEffects(
    [
      { kind: "shake", px: 4 },
      { kind: "dirt", at: { x: 1, y: 2 } },
    ],
    io
  );

  expect([io.play.mock.calls, io.feel.mock.calls, io.record.mock.calls]).toEqual([[], [], []]);
});

test.each([
  ["tick", "a light impact", Haptics.impactAsync, "light"],
  ["release", "a medium impact", Haptics.impactAsync, "medium"],
  ["harvest", "the success buzz", Haptics.notificationAsync, "success"],
] as const)("a %s is %s on the device", (haptic, _, call, feel) => {
  deviceIo(jest.fn()).feel(haptic);

  expect(call).toHaveBeenCalledWith(feel);
});
