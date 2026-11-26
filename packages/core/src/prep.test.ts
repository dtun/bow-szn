import { createPrep, isPrepDone, prepReducer, TUNING, type PrepState } from "./index";

function tick(state: PrepState, dtMs: number): PrepState {
  return prepReducer(state, { type: "tick", dtMs });
}

function tap(state: PrepState): PrepState {
  return prepReducer(state, { type: "tap" });
}

function inZone(state: PrepState): boolean {
  return state.markerPos >= state.zone[0] && state.markerPos <= state.zone[1];
}

function sweepIntoZone(state: PrepState): PrepState {
  let next = state;
  while (!inZone(next)) {
    next = tick(next, 5);
  }
  return next;
}

function width(state: PrepState): number {
  return state.zone[1] - state.zone[0];
}

describe("wax the string", () => {
  test("the marker sweeps the bar and bounces off the far end", () => {
    let prep = createPrep("medium", 7);
    let speed = TUNING.prep.markerBarsPerSec;
    expect(tick(prep, 500).markerPos).toBeCloseTo(0.5 * speed);
    let bounced = tick(prep, 1200 / speed);
    expect(bounced.markerPos).toBeCloseTo(0.8);
    expect(bounced.markerDir).toBe(-1);
  });

  test("a tap outside the zone slips and keeps the count", () => {
    let slipped = tap(createPrep("medium", 7));
    expect(slipped.lastTap).toBe("slip");
    expect(slipped.hits).toBe(0);
  });

  test("a tap in the green counts a hit and moves the zone away from the marker", () => {
    let ready = sweepIntoZone(createPrep("medium", 7));
    let hit = tap(ready);
    expect(hit.lastTap).toBe("hit");
    expect(hit.hits).toBe(1);
    expect(inZone(hit)).toBe(false);
    expect(width(hit)).toBeCloseTo(width(ready));
  });

  test("three hits finish the prep and later events change nothing", () => {
    let prep = createPrep("hard", 11);
    for (let hit = 0; hit < 3; hit++) {
      prep = tap(sweepIntoZone(prep));
    }
    expect(prep.hits).toBe(3);
    expect(isPrepDone(prep)).toBe(true);
    expect(tap(prep)).toBe(prep);
    expect(tick(prep, 100)).toBe(prep);
  });

  test("harder levels sweep faster with a narrower zone", () => {
    let easy = createPrep("easy", 1);
    let medium = createPrep("medium", 1);
    let hard = createPrep("hard", 1);
    expect([easy.speed, medium.speed, hard.speed]).toEqual([0.75, 1, 1.4]);
    expect(width(easy)).toBeCloseTo(TUNING.prep.zoneWidth * 1.25);
    expect(width(medium)).toBeCloseTo(TUNING.prep.zoneWidth);
    expect(width(hard)).toBeCloseTo(TUNING.prep.zoneWidth * 0.7);
  });

  test("the same seed sets up the same prep", () => {
    expect(createPrep("medium", 5)).toEqual(createPrep("medium", 5));
    expect(createPrep("medium", 5).zone).not.toEqual(createPrep("medium", 6).zone);
  });
});
