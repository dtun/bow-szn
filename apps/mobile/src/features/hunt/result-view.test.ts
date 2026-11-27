import { TUNING, type Harvest, type HuntState } from "@bow-szn/core";

import { createSession, type Juice } from "./hunt-session";
import { resultFor } from "./result-view";
import { huntWith } from "./test-support/landing";

const DOE: Harvest = {
  id: "1-7",
  species: "whitetail",
  antlers: { kind: "none" },
  weightLb: 132,
  meatLb: 59,
  spot: "cedar-hollow",
  season: "early",
  clockMin: 381,
  shotYards: 41,
};

const BUCK: Harvest = { ...DOE, antlers: { kind: "rack", points: 8 }, weightLb: 184, meatLb: 83 };

function harvested(harvest: Harvest): HuntState {
  return huntWith([], { kind: "result", outcome: { kind: "harvest", harvest }, shownMs: 0 });
}

function landedAgo(ms: number): Juice {
  let still = createSession(harvested(DOE).config).juice;
  return {
    ...still,
    nowMs: 1000 + ms,
    pop: { text: "BUCK!!", at: { x: 90, y: 200 }, tone: "buck", animalId: 7, startMs: 1000 },
  };
}

test("a doe gets a quick banner, not a card", () => {
  expect(resultFor(harvested(DOE), landedAgo(0))).toMatchObject({
    kind: "banner",
    card: { title: "DOE!", canMount: false },
  });
});

test("a buck's card waits a beat so the fall and the confetti land first", () => {
  expect(resultFor(harvested(BUCK), landedAgo(TUNING.juice.cardDelayMs - 1))).toEqual({
    kind: "none",
  });
});

test("then the card slams in from above and settles in place", () => {
  let delay = TUNING.juice.cardDelayMs;

  let arriving = resultFor(harvested(BUCK), landedAgo(delay));
  let settled = resultFor(harvested(BUCK), landedAgo(delay + TUNING.juice.cardSlamMs));

  expect(arriving).toMatchObject({ kind: "card", dropPx: -180, card: { canMount: true } });
  expect(settled).toMatchObject({ kind: "card", dropPx: 0 });
});

test("a miss shows neither", () => {
  let missed = huntWith([], { kind: "result", outcome: { kind: "miss", near: false }, shownMs: 0 });

  expect(resultFor(missed, landedAgo(0))).toEqual({ kind: "none" });
});
