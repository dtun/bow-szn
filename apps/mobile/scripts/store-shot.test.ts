import {
  aimFromPull,
  createHunt,
  huntReducer,
  HUNTER_POS,
  TUNING,
  type HuntState,
  type Vec2,
} from "@bow-szn/core";

import { worldScale } from "../src/features/hunt/world-scale";
import {
  PAN_SLOP_PT,
  planStoreShot,
  SCREEN_PT,
  SWIPE_MS,
  swipeFor,
  TOUCH_MS,
  WANTED_SLACK_MS,
  type StoreShot,
} from "./store-shot";

const FRAME_MS = 16;
const SWIPE_FRAMES = 30;
const TOUCH_STEP_MS = 100;

let shot = planStoreShot();

function tickFor(hunt: HuntState, ms: number): HuntState {
  let next = hunt;
  for (let elapsed = 0; elapsed < ms; elapsed += FRAME_MS) {
    next = huntReducer(next, { type: "tick", dtMs: FRAME_MS });
  }
  return next;
}

function pullAt(swipe: StoreShot["swipe"], progress: number): Vec2 {
  let drag = { x: swipe.end.x - swipe.start.x, y: swipe.end.y - swipe.start.y };
  let travelPt = Math.hypot(drag.x, drag.y);
  let countedPt = Math.max(0, travelPt * progress - PAN_SLOP_PT);
  let scale = worldScale(SCREEN_PT.width, SCREEN_PT.height);
  return {
    x: (drag.x / travelPt) * (countedPt / scale),
    y: (drag.y / travelPt) * (countedPt / scale),
  };
}

function swipeAt(touchMs: number): HuntState {
  let hunt = tickFor(createHunt(shot.config), touchMs);
  hunt = huntReducer(hunt, { type: "draw-start" });
  for (let frame = 1; frame <= SWIPE_FRAMES; frame++) {
    hunt = huntReducer(hunt, { type: "draw-move", pull: pullAt(shot.swipe, frame / SWIPE_FRAMES) });
    hunt = huntReducer(hunt, { type: "tick", dtMs: SWIPE_MS / SWIPE_FRAMES });
  }
  hunt = huntReducer(hunt, { type: "release" });
  while (hunt.phase.kind === "flight") {
    hunt = huntReducer(hunt, { type: "tick", dtMs: FRAME_MS });
  }
  return hunt;
}

test("drags straight down to shoot straight ahead, a pan's slop past the pull", () => {
  expect(swipeFor({ x: HUNTER_POS.x, y: HUNTER_POS.y - 70 })).toEqual({
    start: { x: 220, y: 443 },
    end: { x: 220, y: 513 },
    durationMs: SWIPE_MS,
  });
});

test("drags back and to the right to shoot up and to the left", () => {
  expect(swipeFor({ x: HUNTER_POS.x - 48, y: HUNTER_POS.y - 64 })).toEqual({
    start: { x: 196, y: 447 },
    end: { x: 244, y: 509 },
    durationMs: SWIPE_MS,
  });
});

test("the planned swipe aims within a pixel and a half of the planned target", () => {
  let aim = aimFromPull(pullAt(shot.swipe, 1), createHunt(shot.config));
  expect(
    aim === null ? Infinity : Math.hypot(aim.target.x - shot.target.x, aim.target.y - shot.target.y)
  ).toBeLessThan(1.5);
});

test("the planned shot stops short of a full draw, so the bow never tires", () => {
  expect(Math.hypot(shot.target.x - HUNTER_POS.x, shot.target.y - HUNTER_POS.y)).toBeLessThan(
    TUNING.aim.fullDrawPower * TUNING.aim.maxRangePx
  );
});

test("leaves the buck standing for at least two seconds either side of the expected touch", () => {
  expect(shot.slackMs).toBeGreaterThanOrEqual(WANTED_SLACK_MS);
});

test("harvests a rack whitetail for every touch inside the standing window", () => {
  let outcomes: string[] = [];
  for (
    let touchMs = TOUCH_MS - shot.slackMs;
    touchMs <= TOUCH_MS + shot.slackMs;
    touchMs += TOUCH_STEP_MS
  ) {
    let phase = swipeAt(touchMs).phase;
    outcomes.push(
      phase.kind === "result" && phase.outcome.kind === "harvest"
        ? `${phase.outcome.harvest.species} ${phase.outcome.harvest.antlers.kind}`
        : `${phase.kind}`
    );
  }
  expect(new Set(outcomes)).toEqual(new Set(["whitetail rack"]));
});
