import { aimFromPull, HUNTER_POS, TUNING, type HuntState } from "./index";

const CALM: Pick<HuntState, "wind" | "phase" | "elapsedMs"> = {
  wind: { dir: 1, strength: 0 },
  phase: { kind: "ready" },
  elapsedMs: 0,
};
const FULL_RANGE_PX = 140;

describe("aimFromPull", () => {
  test("dragging straight down aims straight up-field", () => {
    let aim = aimFromPull({ x: 0, y: 30 }, CALM);
    let power = 30 / TUNING.aim.maxPullPx;
    expect(aim?.dir).toEqual({ x: 0, y: -1 });
    expect(aim?.power).toBe(power);
    expect(aim?.target).toEqual({ x: HUNTER_POS.x, y: HUNTER_POS.y - power * FULL_RANGE_PX });
  });

  test("dragging left aims right along the ground", () => {
    let aim = aimFromPull({ x: -TUNING.aim.maxPullPx, y: 0 }, CALM);
    expect(aim?.dir).toEqual({ x: 1, y: 0 });
    expect(aim?.target).toEqual({ x: HUNTER_POS.x + FULL_RANGE_PX, y: HUNTER_POS.y });
  });

  test("pulling past the max pull clamps power at full and range at 70 yards", () => {
    let aim = aimFromPull({ x: 0, y: TUNING.aim.maxPullPx * 3 }, CALM);
    expect(aim?.power).toBe(1);
    expect(aim?.target).toEqual({ x: HUNTER_POS.x, y: HUNTER_POS.y - FULL_RANGE_PX });
  });

  test("a pull shorter than the dead zone has no aim", () => {
    expect(aimFromPull({ x: 0, y: TUNING.aim.deadZonePx - 1 }, CALM)).toBe(null);
  });

  test("wind drifts the landing point sideways in proportion to range", () => {
    let full = aimFromPull(
      { x: 0, y: TUNING.aim.maxPullPx },
      { ...CALM, wind: { dir: -1, strength: 2 } }
    );
    let half = aimFromPull(
      { x: 0, y: TUNING.aim.maxPullPx / 2 },
      { ...CALM, wind: { dir: -1, strength: 2 } }
    );
    let drift = 2 * TUNING.wind.driftPerStrength;
    expect(full?.target.x).toBeCloseTo(HUNTER_POS.x - drift * FULL_RANGE_PX);
    expect(half?.target.x).toBeCloseTo(HUNTER_POS.x - (drift * FULL_RANGE_PX) / 2);
    expect(full?.dir).toEqual({ x: 0, y: -1 });
  });
});
