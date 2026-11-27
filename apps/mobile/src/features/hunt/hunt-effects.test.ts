import {
  createHunt,
  huntReducer,
  type Animal,
  type HuntEvent,
  type HuntState,
} from "@bow-szn/core";

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
});

test("a buck harvest adds the fanfare, a big shake, and a pile of confetti", () => {
  let prev = aboutToLand([BUCK], BUCK.pos);
  let effects = huntEffects(prev, landed(prev));

  expect(sounds(effects)).toEqual(["hit", "fanfare"]);
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

function callouts(effects: HuntEffect[]): { animalId: number; text: string }[] {
  return effects.flatMap((effect) =>
    effect.kind === "callout" ? [{ animalId: effect.animalId, text: effect.text }] : []
  );
}

function walkingAt(animal: Animal, y: number): Animal {
  return { ...animal, pos: { x: 90, y }, mode: { kind: "walk", target: { x: 90, y: 200 } } };
}

function frames(animals: (y: number) => Animal[], ys: number[]): HuntState[] {
  return ys.map((y, index) => ({ ...huntWith(animals(y)), elapsedMs: 1000 + index * 100 }));
}

function calloutsAcross(states: HuntState[]): { animalId: number; text: string }[][] {
  return states.slice(1).map((next, index) => callouts(huntEffects(states[index], next)));
}

test("a buck walking out of the trees into the open calls BUCK! once, with the glint chime", () => {
  let states = frames((y) => [walkingAt(BUCK, y)], [30, 50, 59, 61, 70, 90]);
  let steps = states.slice(1).map((next, index) => huntEffects(states[index], next));

  expect(steps.map(callouts)).toEqual([[], [], [{ animalId: 7, text: "BUCK!" }], [], []]);
  expect(sounds(steps[2])).toEqual(["glint"]);
});

test("a doe walking into the open gets no callout", () => {
  let states = frames((y) => [walkingAt(DOE, y)], [50, 59, 61, 70]);

  expect(calloutsAcross(states).flat()).toEqual([]);
});

test("a bull elk walking into the open calls BULL!", () => {
  let bull: Animal = { ...BUCK, species: "elk" };
  let states = frames((y) => [walkingAt(bull, y)], [55, 65]);

  expect(calloutsAcross(states)).toEqual([[{ animalId: 7, text: "BULL!" }]]);
});

test("two bucks stepping into the open together each get their own callout", () => {
  let other: Animal = { ...BUCK, id: 8 };
  let states = frames(
    (y) => [walkingAt(BUCK, y), { ...walkingAt(other, y), pos: { x: 40, y } }],
    [55, 65]
  );

  expect(calloutsAcross(states)).toEqual([
    [
      { animalId: 7, text: "BUCK!" },
      { animalId: 8, text: "BUCK!" },
    ],
  ]);
});

test("a buck already in the open when the hunt starts is called out on the first frame only", () => {
  let start = huntWith([BUCK]);
  let first = huntReducer(start, { type: "tick", dtMs: 16 });
  let second = huntReducer(first, { type: "tick", dtMs: 16 });

  expect(callouts(huntEffects(start, first))).toEqual([{ animalId: 7, text: "BUCK!" }]);
  expect(callouts(huntEffects(first, second))).toEqual([]);
});

test("a buck in the open is not called out before the first frame, so a quick draw cannot double it", () => {
  let start = huntWith([BUCK]);
  let drawn = huntReducer(start, { type: "draw-start" });
  let first = huntReducer(drawn, { type: "tick", dtMs: 16 });

  expect(callouts(huntEffects(start, drawn))).toEqual([]);
  expect(callouts(huntEffects(drawn, first))).toEqual([{ animalId: 7, text: "BUCK!" }]);
});

test("across a whole rut morning every rack that walks into the open is called out exactly once", () => {
  let hunt = createHunt({ spot: "cedar-hollow", season: "rut", difficulty: "easy", seed: 4242 });
  let called: number[] = [];
  let seenInTheOpen = new Set<number>();
  for (let step = 0; step < 4 * 60 * 60; step++) {
    let next = huntReducer(hunt, { type: "tick", dtMs: 100 });
    called.push(...callouts(huntEffects(hunt, next)).map((each) => each.animalId));
    next.animals
      .filter((animal) => animal.antlers.kind === "rack" && animal.mode.kind !== "down")
      .filter((animal) => animal.pos.x >= 0 && animal.pos.x <= 180 && animal.pos.y >= 60)
      .forEach((animal) => seenInTheOpen.add(animal.id));
    hunt = next;
  }

  expect(called.length).toBeGreaterThan(0);
  expect(called).toEqual([...new Set(called)]);
  expect(new Set(called)).toEqual(seenInTheOpen);
});
