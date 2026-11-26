import {
  createHunt,
  currentAim,
  huntReducer,
  HUNTER_POS,
  TUNING,
  type Animal,
  type HuntConfig,
  type HuntEvent,
  type HuntState,
  type Vec2,
} from "./index";

const CONFIG: HuntConfig = {
  spot: "miller-bottoms",
  season: "early",
  difficulty: "medium",
  seed: 42,
};

const LONG_MS = 10 * 60 * 1000;

const DOE: Animal = {
  id: 1,
  species: "whitetail",
  antlers: { kind: "none" },
  pos: { x: 90, y: 180 },
  facing: 1,
  mode: { kind: "graze", untilMs: LONG_MS },
};

function huntWith(animals: Animal[]): HuntState {
  return {
    ...createHunt(CONFIG),
    wind: { dir: 1, strength: 0 },
    animals,
    nextAnimalId: 100,
    spawnInMs: LONG_MS,
  };
}

function play(state: HuntState, events: HuntEvent[]): HuntState {
  return events.reduce(huntReducer, state);
}

function pullToward(point: Vec2): Vec2 {
  let pxPerRangePx = TUNING.aim.maxPullPx / 140;
  return {
    x: (HUNTER_POS.x - point.x) * pxPerRangePx,
    y: (HUNTER_POS.y - point.y) * pxPerRangePx,
  };
}

function shootAt(point: Vec2): HuntEvent[] {
  return [
    { type: "draw-start" },
    { type: "draw-move", pull: pullToward(point) },
    { type: "release" },
    { type: "tick", dtMs: 2000 },
  ];
}

describe("createHunt", () => {
  test("starts ready at 6:00 AM with a quiver sized by difficulty", () => {
    let easy = createHunt({ ...CONFIG, difficulty: "easy" });
    expect(easy.phase).toEqual({ kind: "ready" });
    expect(easy.clockMin).toBe(6 * 60);
    expect(easy.harvests).toEqual([]);
    expect(easy.arrows).toBe(6);
    expect(createHunt({ ...CONFIG, difficulty: "medium" }).arrows).toBe(5);
    expect(createHunt({ ...CONFIG, difficulty: "hard" }).arrows).toBe(4);
  });
});

describe("the draw", () => {
  test("a pull under the dead zone then release returns to ready with the same arrow count", () => {
    let hunt = huntWith([DOE]);
    let after = play(hunt, [
      { type: "draw-start" },
      { type: "draw-move", pull: { x: 0, y: TUNING.aim.deadZonePx - 1 } },
      { type: "release" },
    ]);
    expect(after.phase).toEqual({ kind: "ready" });
    expect(after.arrows).toBe(hunt.arrows);
  });

  test("cancelling a full draw returns to ready without spending an arrow", () => {
    let hunt = huntWith([DOE]);
    let after = play(hunt, [
      { type: "draw-start" },
      { type: "draw-move", pull: { x: 0, y: TUNING.aim.maxPullPx } },
      { type: "cancel" },
    ]);
    expect(after.phase).toEqual({ kind: "ready" });
    expect(after.arrows).toBe(hunt.arrows);
  });

  test("a release spends one arrow and flies it to the reticle", () => {
    let hunt = huntWith([DOE]);
    let after = play(hunt, [
      { type: "draw-start" },
      { type: "draw-move", pull: { x: 0, y: TUNING.aim.maxPullPx } },
      { type: "release" },
    ]);
    expect(after.arrows).toBe(hunt.arrows - 1);
    expect(after.phase).toEqual({
      kind: "flight",
      arrow: {
        from: HUNTER_POS,
        to: { x: HUNTER_POS.x, y: HUNTER_POS.y - 140 },
        durationMs: TUNING.arrow.baseFlightMs + (140 / TUNING.arrow.speedPxPerSec) * 1000,
        elapsedMs: 0,
        peakHeight: 140 * TUNING.arrow.arcHeightPerPx,
      },
    });
  });

  test("the arrow stays in the air until its flight time is up", () => {
    let drawn = play(huntWith([DOE]), shootAt(DOE.pos).slice(0, 3));
    let durationMs = drawn.phase.kind === "flight" ? drawn.phase.arrow.durationMs : 0;
    let justBefore = huntReducer(drawn, { type: "tick", dtMs: durationMs - 10 });
    let justAfter = huntReducer(justBefore, { type: "tick", dtMs: 20 });
    expect(justBefore.phase.kind).toBe("flight");
    expect(justAfter.phase.kind).toBe("result");
  });

  test("the current aim follows the pull while drawing and is gone otherwise", () => {
    let ready = huntWith([DOE]);
    let drawing = play(ready, [
      { type: "draw-start" },
      { type: "draw-move", pull: { x: 0, y: TUNING.aim.maxPullPx / 2 } },
    ]);
    expect(currentAim(ready)).toBe(null);
    expect(currentAim(drawing)?.target).toEqual({ x: HUNTER_POS.x, y: HUNTER_POS.y - 70 });
  });

  test("an empty quiver cannot draw", () => {
    let empty = { ...huntWith([DOE]), arrows: 0 };
    expect(huntReducer(empty, { type: "draw-start" })).toBe(empty);
  });
});

describe("the shot", () => {
  test("releasing on a stationary doe at full precision harvests it", () => {
    let after = play(huntWith([DOE]), shootAt(DOE.pos));
    let outcome = after.phase.kind === "result" ? after.phase.outcome : null;
    let harvest = outcome?.kind === "harvest" ? outcome.harvest : null;
    let weightLb = harvest?.weightLb ?? 0;
    expect(harvest).toEqual({
      id: expect.any(String),
      species: "whitetail",
      antlers: { kind: "none" },
      weightLb,
      meatLb: Math.round(weightLb * 0.45),
      spot: "miller-bottoms",
      season: "early",
      clockMin: 6 * 60,
      shotYards: 55,
    });
    expect(weightLb).toBeGreaterThanOrEqual(110);
    expect(weightLb).toBeLessThanOrEqual(260);
    expect(after.harvests).toEqual([harvest]);
    expect(after.animals[0].mode).toEqual({ kind: "down" });
  });

  test("a landing far from every animal is a plain miss", () => {
    let after = play(huntWith([DOE]), shootAt({ x: 90, y: 240 }));
    expect(after.phase).toEqual({ kind: "result", outcome: { kind: "miss", near: false } });
    expect(after.harvests).toEqual([]);
  });

  test("a landing outside the hit zone but within twice its radius is close", () => {
    let after = play(huntWith([DOE]), shootAt({ x: DOE.pos.x + 10, y: DOE.pos.y }));
    expect(after.phase).toEqual({ kind: "result", outcome: { kind: "miss", near: true } });
  });

  test("dismissing the result returns to ready with one arrow spent", () => {
    let hunt = huntWith([DOE]);
    let after = play(hunt, [...shootAt({ x: 90, y: 240 }), { type: "dismiss" }]);
    expect(after.phase).toEqual({ kind: "ready" });
    expect(after.arrows).toBe(hunt.arrows - 1);
  });
});

describe("the reducer", () => {
  test("events outside their phase change nothing", () => {
    let ready = huntWith([DOE]);
    expect(huntReducer(ready, { type: "release" })).toBe(ready);
    expect(huntReducer(ready, { type: "dismiss" })).toBe(ready);
    expect(huntReducer(ready, { type: "cancel" })).toBe(ready);
    expect(huntReducer(ready, { type: "draw-move", pull: { x: 0, y: 30 } })).toBe(ready);
    let flying = play(ready, shootAt(DOE.pos).slice(0, 3));
    expect(huntReducer(flying, { type: "draw-start" })).toBe(flying);
  });

  test("the same seed and the same events give the same state", () => {
    let events: HuntEvent[] = [
      ...shootAt(DOE.pos),
      { type: "dismiss" },
      { type: "tick", dtMs: 1234 },
      ...shootAt({ x: 40, y: 200 }),
    ];
    expect(play(createHunt(CONFIG), events)).toEqual(play(createHunt(CONFIG), events));
  });
});
