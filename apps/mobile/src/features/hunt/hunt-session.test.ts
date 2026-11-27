import { TUNING, type HuntEvent, type HuntState } from "@bow-szn/core";

import { createSession, stepSession, type HuntSession } from "./hunt-session";
import { aboutToLand, BUCK, DOE, EMPTY_GROUND } from "./test-support/landing";

function sessionOf(hunt: HuntState): HuntSession {
  return { ...createSession(hunt.config), hunt };
}

function play(session: HuntSession, events: HuntEvent[]): HuntSession {
  return events.reduce((current, event) => stepSession(current, event).session, session);
}

function frames(count: number, dtMs = 50): HuntEvent[] {
  return Array.from({ length: count }, () => ({ type: "tick", dtMs }));
}

test("a buck hit freezes the hunt for the hit-stop, then lets it run again", () => {
  let hit = stepSession(sessionOf(aboutToLand([BUCK], BUCK.pos)), { type: "tick", dtMs: 20 });
  let landedAtMs = hit.session.hunt.elapsedMs;
  let frozen = play(hit.session, frames(2));

  expect(frozen.hunt.elapsedMs).toBe(landedAtMs);

  let thawed = play(frozen, frames(1));

  expect(thawed.hunt.elapsedMs).toBe(landedAtMs + 50);
});

test("a doe hit never freezes", () => {
  let hit = stepSession(sessionOf(aboutToLand([DOE], DOE.pos)), { type: "tick", dtMs: 20 });
  let landedAtMs = hit.session.hunt.elapsedMs;

  expect(play(hit.session, frames(1)).hunt.elapsedMs).toBe(landedAtMs + 50);
});

test("a buck's confetti and shake wait out the hit-stop", () => {
  let hit = stepSession(sessionOf(aboutToLand([BUCK], BUCK.pos)), { type: "tick", dtMs: 20 });
  let starts = hit.session.juice.bursts.map((burst) => [burst.kind, burst.startMs]);

  expect(starts).toEqual([
    ["shake", 140],
    ["confetti", 140],
  ]);
});

test("a miss lingers on its line, then the bow is ready again", () => {
  let missed = stepSession(sessionOf(aboutToLand([], EMPTY_GROUND)), { type: "tick", dtMs: 20 });

  expect(missed.session.hunt.phase.kind).toBe("result");

  let lingering = play(missed.session, frames(TUNING.juice.resultMs / 50 - 1));

  expect(lingering.hunt.phase.kind).toBe("result");

  let ready = play(lingering, frames(1));

  expect(ready.hunt.phase).toEqual({ kind: "ready" });
});

test("drawing during a result shrugs it off and starts the draw", () => {
  let missed = stepSession(sessionOf(aboutToLand([], EMPTY_GROUND)), { type: "tick", dtMs: 20 });

  let drawing = stepSession(missed.session, { type: "draw-start" });

  expect(drawing.session.hunt.phase).toEqual({ kind: "drawing", pull: { x: 0, y: 0 }, heldMs: 0 });
  expect(drawing.effects).toEqual([{ kind: "sound", sound: "creak" }]);
});

test("a dirt puff clears once its moment has passed", () => {
  let missed = stepSession(sessionOf(aboutToLand([], EMPTY_GROUND)), { type: "tick", dtMs: 20 });
  function puffs(session: HuntSession): number {
    return session.juice.bursts.filter((burst) => burst.kind === "dirt").length;
  }

  expect(puffs(missed.session)).toBe(1);
  expect(puffs(play(missed.session, frames(TUNING.juice.puffMs / 50)))).toBe(0);
});

test("each step hands back the effects it caused", () => {
  let missed = stepSession(sessionOf(aboutToLand([], EMPTY_GROUND)), { type: "tick", dtMs: 20 });

  expect(missed.effects.map((effect) => effect.kind)).toEqual([
    "sound",
    "sound",
    "dirt",
    "stuck",
    "pop",
  ]);
});
