import {
  createHunt,
  currentAim,
  huntReducer,
  HUNTER_POS,
  TUNING,
  type HuntState,
  type Vec2,
} from "./index";
import { CONFIG, huntWith, play } from "./test-support/hunt-scenario";

const FULL_PULL: Vec2 = { x: 0, y: TUNING.aim.maxPullPx };

function heldFor(heldMs: number, pull = FULL_PULL): HuntState {
  return play(huntWith([]), [
    { type: "draw-start" },
    { type: "draw-move", pull },
    { type: "tick", dtMs: heldMs },
  ]);
}

function widestSwayOverOnePeriod(start: HuntState): number {
  let widest = 0;
  let state = start;
  for (let sampleMs = 0; sampleMs < TUNING.sway.periodMs; sampleMs += 10) {
    widest = Math.max(widest, Math.abs(currentAim(state)?.sway.x ?? 0));
    state = huntReducer(state, { type: "tick", dtMs: 10 });
  }
  return widest;
}

function releaseTarget(state: HuntState) {
  let flying = huntReducer(state, { type: "release" });
  return flying.phase.kind === "flight" ? flying.phase.arrow.to : null;
}

describe("sway", () => {
  test("a full draw holds steady for the first 2.5 seconds", () => {
    expect(currentAim(heldFor(2500))?.sway).toEqual({ x: 0, y: 0 });
  });

  test("a quick release flies true to the reticle", () => {
    expect(releaseTarget(heldFor(1000))).toEqual({ x: HUNTER_POS.x, y: HUNTER_POS.y - 140 });
  });

  test("past the onset the reticle sways wider the longer the draw is held", () => {
    let growth = TUNING.sway.growthPxPerSec;
    let periodSec = TUNING.sway.periodMs / 1000;
    let oneSecondIn = widestSwayOverOnePeriod(heldFor(2500 + 1000));
    expect(oneSecondIn).toBeGreaterThan(growth * 1 * 0.95);
    expect(oneSecondIn).toBeLessThanOrEqual(growth * (1 + periodSec));
    expect(widestSwayOverOnePeriod(heldFor(60_000))).toBeCloseTo(TUNING.sway.maxPx, 1);
  });

  test("a swaying release lands where the reticle was", () => {
    let tired = heldFor(5000);
    let reticle = currentAim(tired)?.target;
    expect(reticle).not.toEqual({ x: HUNTER_POS.x, y: HUNTER_POS.y - 140 });
    expect(releaseTarget(tired)).toEqual(reticle);
  });

  test("a draw short of full never tires", () => {
    let half = { x: 0, y: TUNING.aim.maxPullPx / 2 };
    expect(currentAim(heldFor(10_000, half))?.sway).toEqual({ x: 0, y: 0 });
  });
});

describe("wind", () => {
  test("each hunt rolls its own wind from calm to the strongest flag", () => {
    let winds = Array.from(
      { length: 300 },
      (_, index) => createHunt({ ...CONFIG, seed: index }).wind
    );
    let strengths = new Set(winds.map((wind) => wind.strength));
    let dirs = new Set(winds.map((wind) => wind.dir));
    expect(strengths).toEqual(new Set([0, 1, 2, 3]));
    expect(dirs).toEqual(new Set([-1, 1]));
  });

  test("the hunt's wind pushes the reticle downwind", () => {
    let windy = { ...huntWith([]), wind: { dir: 1 as const, strength: 3 } };
    let drawing = play(windy, [{ type: "draw-start" }, { type: "draw-move", pull: FULL_PULL }]);
    expect(currentAim(drawing)?.target.x).toBeCloseTo(
      HUNTER_POS.x + 3 * TUNING.wind.driftPerStrength * 140
    );
  });
});
