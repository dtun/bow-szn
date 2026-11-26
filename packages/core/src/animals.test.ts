import { HUNTER_POS, huntReducer, TUNING, type Animal, type HuntState, type Vec2 } from "./index";
import { CONFIG, DOE, huntWith, play, shootAt } from "./test-support/hunt-scenario";

const WHITETAIL_SPEED = 14;

function walker(pos: Vec2, target: Vec2): Animal {
  return { ...DOE, id: 2, pos, facing: -1, mode: { kind: "walk", target } };
}

function tick(state: HuntState, dtMs: number): HuntState {
  return huntReducer(state, { type: "tick", dtMs });
}

function only(state: HuntState): Animal {
  return state.animals[0];
}

describe("animal modes", () => {
  test("a grazing animal holds still until its graze ends, then walks into the open middle", () => {
    let grazing = huntWith([{ ...DOE, mode: { kind: "graze", untilMs: 1000 } }]);
    let before = tick(grazing, 990);
    let after = tick(before, 20);
    let meadow = TUNING.animals.meadow;
    let mode = only(after).mode;
    let target = mode.kind === "walk" ? mode.target : { x: -1, y: -1 };
    expect(only(before)).toEqual(only(grazing));
    expect(mode.kind).toBe("walk");
    expect(target.x).toBeGreaterThanOrEqual(meadow.minX);
    expect(target.x).toBeLessThanOrEqual(meadow.maxX);
    expect(target.y).toBeGreaterThanOrEqual(meadow.minY);
    expect(target.y).toBeLessThanOrEqual(meadow.maxY);
  });

  test("a walking animal covers its species speed each second and faces where it goes", () => {
    let after = tick(huntWith([walker({ x: 40, y: 180 }, { x: 150, y: 180 })]), 1000);
    expect(only(after).pos.x).toBeCloseTo(40 + WHITETAIL_SPEED);
    expect(only(after).pos.y).toBe(180);
    expect(only(after).facing).toBe(1);
  });

  test("difficulty sets how fast animals move", () => {
    let start = walker({ x: 40, y: 180 }, { x: 150, y: 180 });
    let easy = tick(huntWith([start], { ...CONFIG, difficulty: "easy" }), 1000);
    let hard = tick(huntWith([start], { ...CONFIG, difficulty: "hard" }), 1000);
    expect(only(easy).pos.x).toBeCloseTo(40 + WHITETAIL_SPEED * 0.85);
    expect(only(hard).pos.x).toBeCloseTo(40 + WHITETAIL_SPEED * 1.2);
  });

  test("a walker that arrives stops on its target to graze for a beat", () => {
    let after = tick(huntWith([walker({ x: 90, y: 180 }, { x: 92, y: 180 })]), 1000);
    let mode = only(after).mode;
    let untilMs = mode.kind === "graze" ? mode.untilMs : 0;
    expect(only(after).pos).toEqual({ x: 92, y: 180 });
    expect(mode.kind).toBe("graze");
    expect(untilMs).toBeGreaterThanOrEqual(TUNING.animals.grazeMs[0]);
    expect(untilMs).toBeLessThanOrEqual(1000 + TUNING.animals.grazeMs[1]);
  });

  test("an alert animal holds still, then settles back to grazing", () => {
    let alert = huntWith([{ ...DOE, mode: { kind: "alert", untilMs: 500 } }]);
    let before = tick(alert, 490);
    let after = tick(before, 20);
    expect(only(before)).toEqual(only(alert));
    expect(only(after).pos).toEqual(DOE.pos);
    expect(only(after).mode.kind).toBe("graze");
  });

  test("a fleeing animal bolts at a multiple of its walk speed and is gone off the field", () => {
    let fleeing = huntWith([
      { ...DOE, pos: { x: 160, y: 180 }, mode: { kind: "flee", dir: { x: 1, y: 0 } } },
    ]);
    let bolting = tick(fleeing, 100);
    let left = tick(bolting, 1000);
    expect(only(bolting).pos.x).toBeCloseTo(160 + WHITETAIL_SPEED * 3.5 * 0.1);
    expect(only(bolting).mode.kind).toBe("flee");
    expect(only(left).mode).toEqual({ kind: "gone" });
  });
});

describe("moving targets", () => {
  let start = { x: 40, y: 180 };

  test("an arrow aimed where a walking animal stands misses because it moved during flight", () => {
    let after = play(huntWith([walker(start, { x: 150, y: 180 })]), shootAt(start));
    let outcome = after.phase.kind === "result" ? after.phase.outcome.kind : "none";
    expect(outcome).toBe("miss");
  });

  test("leading a walking animal by the arrow's flight time hits it", () => {
    let lead = start;
    for (let pass = 0; pass < 3; pass++) {
      let flightPx = Math.hypot(lead.x - HUNTER_POS.x, lead.y - HUNTER_POS.y);
      let flightSec = TUNING.arrow.baseFlightMs / 1000 + flightPx / TUNING.arrow.speedPxPerSec;
      lead = { x: start.x + WHITETAIL_SPEED * flightSec, y: start.y };
    }
    let after = play(huntWith([walker(start, { x: 150, y: 180 })]), shootAt(lead));
    let outcome = after.phase.kind === "result" ? after.phase.outcome.kind : "none";
    expect(outcome).toBe("harvest");
  });
});
