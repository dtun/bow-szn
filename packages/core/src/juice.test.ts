import {
  flightOutcome,
  glintProgress,
  huntReducer,
  isGlinting,
  shotWillHit,
  timeScale,
  TUNING,
  type Animal,
  type HuntState,
  type ShotOutcome,
  type Vec2,
} from "./index";
import { DOE, huntWith, play, shootAt } from "./test-support/hunt-scenario";

const BUCK: Animal = { ...DOE, antlers: { kind: "rack", points: 10 } };
const WALKER: Animal = {
  ...DOE,
  pos: { x: 40, y: 180 },
  mode: { kind: "walk", target: { x: 150, y: 180 } },
};

function released(animals: Animal[], at: Vec2): HuntState {
  return play(huntWith(animals), shootAt(at).slice(0, 3));
}

function tick(state: HuntState, dtMs: number): HuntState {
  return huntReducer(state, { type: "tick", dtMs });
}

function landed(state: HuntState): HuntState {
  return tick(state, 2000);
}

function realMsToLand(state: HuntState): number {
  let next = state;
  let realMs = 0;
  while (next.phase.kind === "flight") {
    next = tick(next, 16);
    realMs += 16;
  }
  return realMs;
}

function outcomeOf(state: HuntState): ShotOutcome | null {
  return state.phase.kind === "result" ? state.phase.outcome : null;
}

function flightMs(state: HuntState): number {
  return state.phase.kind === "flight" ? state.phase.arrow.durationMs : 0;
}

describe("shot prediction", () => {
  test("shotWillHit is true while an arrow flies at a stationary doe", () => {
    expect(shotWillHit(released([DOE], DOE.pos))).toBe(true);
    expect(shotWillHit(released([DOE], { x: 90, y: 240 }))).toBe(false);
    expect(shotWillHit(huntWith([DOE]))).toBe(false);
  });

  test("the prediction knows a walking animal will have moved", () => {
    expect(shotWillHit(released([WALKER], WALKER.pos))).toBe(false);
  });

  test("the predicted outcome is the outcome the arrow lands with", () => {
    let atDoe = released([DOE], DOE.pos);
    let atWalker = released([WALKER], WALKER.pos);
    expect(flightOutcome(atDoe)).toEqual(outcomeOf(landed(atDoe)));
    expect(flightOutcome(atWalker)).toEqual(outcomeOf(landed(atWalker)));
  });
});

describe("buck slow-mo", () => {
  test("time slows only in the last 30% of a flight that will down a buck", () => {
    let atBuck = released([BUCK], BUCK.pos);
    let early = tick(atBuck, flightMs(atBuck) * 0.6);
    let late = tick(early, flightMs(atBuck) * 0.15);
    let atDoe = released([DOE], DOE.pos);
    expect(timeScale(early)).toBe(1);
    expect(timeScale(late)).toBe(TUNING.juice.slowMoRate);
    expect(timeScale(tick(atDoe, flightMs(atDoe) * 0.75))).toBe(1);
  });

  test("a buck shot takes longer in real time than the same shot at a doe", () => {
    let atBuck = released([BUCK], BUCK.pos);
    let duration = flightMs(atBuck);
    let slowed = duration * 0.7 + (duration * 0.3) / TUNING.juice.slowMoRate;
    expect(realMsToLand(released([DOE], DOE.pos))).toBeLessThanOrEqual(duration + 16);
    expect(realMsToLand(atBuck)).toBeGreaterThan(slowed - 32);
    expect(realMsToLand(atBuck)).toBeLessThan(slowed + 32);
  });
});

describe("rack glint", () => {
  function glintingSamples(animal: Animal): number {
    let samples = 0;
    for (let elapsedMs = 0; elapsedMs < TUNING.juice.glintEveryMs; elapsedMs += 10) {
      samples += isGlinting(animal, elapsedMs) ? 1 : 0;
    }
    return samples;
  }

  test("a big rack glints for a moment once every few seconds", () => {
    expect(glintingSamples(BUCK)).toBe(TUNING.juice.glintMs / 10);
  });

  test("does, spikes, small racks, and downed bucks never glint", () => {
    expect(glintingSamples(DOE)).toBe(0);
    expect(glintingSamples({ ...DOE, antlers: { kind: "spike" } })).toBe(0);
    expect(glintingSamples({ ...DOE, antlers: { kind: "rack", points: 4 } })).toBe(0);
    expect(glintingSamples({ ...BUCK, mode: { kind: "down" } })).toBe(0);
  });

  test("two bucks on the field glint at different moments", () => {
    let other = { ...BUCK, id: 2 };
    let together = Array.from({ length: 300 }, (_, index) => index * 10).filter(
      (elapsedMs) => isGlinting(BUCK, elapsedMs) && isGlinting(other, elapsedMs)
    );
    expect(together).toEqual([]);
  });
});

test("a glint runs from the start of its window to the end, and is absent outside it", () => {
  function progressAt(elapsedMs: number): number | null {
    return glintProgress(BUCK, elapsedMs);
  }
  let starts = Array.from({ length: TUNING.juice.glintEveryMs }, (_, ms) => ms).filter(
    (ms) => progressAt(ms) === 0
  );
  expect(starts).toHaveLength(1);
  let start = starts[0];
  expect(progressAt(start + TUNING.juice.glintMs / 2)).toBe(0.5);
  expect(progressAt(start + TUNING.juice.glintMs)).toBeNull();
  expect(isGlinting(BUCK, start)).toBe(true);
  expect(isGlinting(BUCK, start + TUNING.juice.glintMs)).toBe(false);
});
