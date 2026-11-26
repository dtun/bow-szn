import { aimFromPull, arrowAt, HUNTER_POS, previewPath, TUNING, type Arrow } from "./index";

const TARGET = { x: HUNTER_POS.x, y: HUNTER_POS.y - 140 };
const ARROW: Arrow = {
  from: HUNTER_POS,
  to: TARGET,
  durationMs: 800,
  elapsedMs: 0,
  peakHeight: 30,
};

describe("arrowAt", () => {
  test("starts on the ground at the hunter", () => {
    expect(arrowAt(ARROW)).toEqual({ ground: HUNTER_POS, height: 0 });
  });

  test("peaks halfway along the ground track", () => {
    expect(arrowAt({ ...ARROW, elapsedMs: 400 })).toEqual({
      ground: { x: HUNTER_POS.x, y: HUNTER_POS.y - 70 },
      height: 30,
    });
  });

  test("comes down on the target and stays there", () => {
    expect(arrowAt({ ...ARROW, elapsedMs: 1200 })).toEqual({ ground: TARGET, height: 0 });
  });
});

describe("previewPath", () => {
  test("lifts the ground track from the hunter to the reticle by the arc height", () => {
    let aim = aimFromPull({ x: 0, y: TUNING.aim.maxPullPx }, { wind: { dir: 1, strength: 0 } });
    let peak = 140 * TUNING.arrow.arcHeightPerPx;
    let path = aim === null ? [] : previewPath(aim, 3);
    expect(path).toEqual([HUNTER_POS, { x: HUNTER_POS.x, y: HUNTER_POS.y - 70 - peak }, TARGET]);
  });
});
