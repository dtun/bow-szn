import { huntReducer, type HuntEvent, type HuntState } from "@bow-szn/core";

import { huntEffects, type HuntEffect } from "./hunt-effects";
import { aboutToLand, BUCK, DOE, EMPTY_GROUND, huntWith, landed } from "./test-support/landing";

function after(prev: HuntState, event: HuntEvent): HuntEffect[] {
  return huntEffects(prev, huntReducer(prev, event));
}

function sounds(effects: HuntEffect[]): string[] {
  return effects.flatMap((effect) => (effect.kind === "sound" ? [effect.sound] : []));
}

function haptics(effects: HuntEffect[]): string[] {
  return effects.flatMap((effect) => (effect.kind === "haptic" ? [effect.haptic] : []));
}

function kinds(effects: HuntEffect[]): string[] {
  return effects.map((effect) => effect.kind);
}

function drawn(pullY: number): HuntState {
  return huntWith([], { kind: "drawing", pull: { x: 0, y: pullY }, heldMs: 0 });
}

test("starting the draw creaks the bow", () => {
  expect(after(huntWith([]), { type: "draw-start" })).toEqual([{ kind: "sound", sound: "creak" }]);
});

test("each power segment the pull climbs creaks again and ticks the phone", () => {
  let effects = after(drawn(0), { type: "draw-move", pull: { x: 0, y: 30 } });

  expect(effects).toEqual([
    { kind: "sound", sound: "creak" },
    { kind: "haptic", haptic: "tick" },
  ]);
});

test("easing off the pull is silent", () => {
  expect(after(drawn(30), { type: "draw-move", pull: { x: 0, y: 20 } })).toEqual([]);
});

test("reaching full draw clicks", () => {
  let effects = after(drawn(30), { type: "draw-move", pull: { x: 0, y: 60 } });

  expect(sounds(effects)).toEqual(["creak", "full-draw"]);
});

test("the release twangs and whooshes, with a medium kick in the hand", () => {
  let effects = after(drawn(30), { type: "release" });

  expect(sounds(effects)).toEqual(["twang", "whoosh"]);
  expect(haptics(effects)).toEqual(["release"]);
});

test("a doe harvest hits, records the harvest, and pops a snack line", () => {
  let prev = aboutToLand([DOE], DOE.pos);
  let next = landed(prev);
  let effects = huntEffects(prev, next);
  let harvest =
    next.phase.kind === "result" && next.phase.outcome.kind === "harvest"
      ? next.phase.outcome.harvest
      : null;

  expect(sounds(effects)).toEqual(["hit"]);
  expect(haptics(effects)).toEqual(["harvest"]);
  expect(effects).toContainEqual({ kind: "record", harvest });
  expect(effects).toContainEqual({ kind: "shake", px: 2 });
  expect(effects).toContainEqual({ kind: "confetti", at: DOE.pos, count: 16 });
  expect(effects).toContainEqual({
    kind: "pop",
    pop: { text: "DOE!", at: DOE.pos, tone: "snack", animalId: 7 },
  });
  expect(kinds(effects)).not.toContain("hit-stop");
});

test("a buck harvest adds the fanfare, the hit-stop, a big shake, and a pile of confetti", () => {
  let prev = aboutToLand([BUCK], BUCK.pos);
  let effects = huntEffects(prev, landed(prev));

  expect(sounds(effects)).toEqual(["hit", "fanfare"]);
  expect(kinds(effects)).toContain("hit-stop");
  expect(kinds(effects)).toContain("record");
  expect(effects).toContainEqual({ kind: "shake", px: 4 });
  expect(effects).toContainEqual({ kind: "confetti", at: BUCK.pos, count: 72 });
  expect(effects).toContainEqual({
    kind: "pop",
    pop: { text: "BUCK!!", at: BUCK.pos, tone: "buck", animalId: 7 },
  });
});

test("a miss thunks into the dirt, whiffs, puffs dirt, and leaves the arrow standing", () => {
  let prev = aboutToLand([], EMPTY_GROUND);
  let effects = huntEffects(prev, landed(prev));

  expect(sounds(effects)).toEqual(["thunk", "whiff"]);
  expect(kinds(effects)).not.toContain("record");
  expect(effects).toContainEqual({ kind: "dirt", at: EMPTY_GROUND });
  expect(kinds(effects)).toContain("stuck");
});

test("a plain miss gets a funny line, never a scolding", () => {
  let prev = aboutToLand([], EMPTY_GROUND);
  let pop = huntEffects(prev, landed(prev)).find((effect) => effect.kind === "pop");

  expect(pop).toMatchObject({ pop: { tone: "miss" } });
  expect(["WHIFF!", "DIRT NAP!"]).toContain(pop?.kind === "pop" ? pop.pop.text : null);
});

test("a near miss says SO CLOSE!", () => {
  let prev = aboutToLand([DOE], { x: DOE.pos.x + 12, y: DOE.pos.y });
  let pop = huntEffects(prev, landed(prev)).find((effect) => effect.kind === "pop");

  expect(pop).toMatchObject({ pop: { text: "SO CLOSE!", tone: "near" } });
});

test("a miss that spooks a deer blames the deer, and it bolts in a puff of dust", () => {
  let prev = aboutToLand([DOE], { x: DOE.pos.x + 20, y: DOE.pos.y });
  let next = landed(prev);
  let effects = huntEffects(prev, next);

  expect(effects).toContainEqual({
    kind: "pop",
    pop: { text: "THAT DEER SAW YOU.", at: { x: 110, y: 200 }, tone: "miss", animalId: null },
  });
  expect(sounds(effects)).toEqual(["thunk", "whiff", "spook"]);
  expect(effects).toContainEqual({ kind: "dust", at: next.animals[0].pos });
});

test("drawing right beside an animal startles it", () => {
  let close = { ...DOE, pos: { x: 90, y: 282 } };

  expect(sounds(after(huntWith([close]), { type: "draw-start" }))).toEqual(["creak", "spook"]);
});

test("a big rack's glint chimes as it catches the light", () => {
  let quiet = { ...huntWith([BUCK]), elapsedMs: 2150 };

  expect(sounds(after(quiet, { type: "tick", dtMs: 20 }))).toEqual(["glint"]);
});

test("nothing changes, nothing fires", () => {
  let hunt = huntWith([DOE]);

  expect(huntEffects(hunt, hunt)).toEqual([]);
});
