import { createHunt, type Harvest, type HuntPhase, type HuntState } from "@bow-szn/core";

import { overPanelFor, tagName } from "./hunt-over";

const DOE: Harvest = {
  id: "1-3",
  species: "whitetail",
  antlers: { kind: "none" },
  weightLb: 132,
  meatLb: 59,
  spot: "cedar-hollow",
  season: "early",
  clockMin: 381,
  shotYards: 41,
};

const BUCK: Harvest = {
  ...DOE,
  id: "1-4",
  antlers: { kind: "rack", points: 8 },
  weightLb: 184,
  meatLb: 83,
};

function huntEnded(phase: HuntPhase, harvests: Harvest[]): HuntState {
  let hunt = createHunt({ spot: "cedar-hollow", season: "early", difficulty: "easy", seed: 1 });
  return { ...hunt, phase, harvests };
}

test("a hunt still going has no game-over panel", () => {
  expect(overPanelFor(huntEnded({ kind: "ready" }, []))).toBe(null);
});

test("an empty quiver tallies the morning's tags and fills the freezer", () => {
  let panel = overPanelFor(
    huntEnded({ kind: "over", reason: "quiver-empty" }, [DOE, BUCK, { ...DOE, id: "1-5" }])
  );

  expect(panel).toEqual({
    title: "OUT OF ARROWS",
    tags: ["DOE 2", "BUCK 1"],
    freezerLb: 201,
  });
});

test("the end of legal light with nothing tagged says so", () => {
  expect(overPanelFor(huntEnded({ kind: "over", reason: "dusk" }, []))).toEqual({
    title: "LEGAL LIGHT IS DONE",
    tags: ["NO TAGS THIS MORNING"],
    freezerLb: 0,
  });
});

test.each([
  ["whitetail", { kind: "none" }, "DOE"],
  ["whitetail", { kind: "spike" }, "SPIKE"],
  ["whitetail", { kind: "rack", points: 10 }, "BUCK"],
  ["elk", { kind: "none" }, "COW"],
  ["elk", { kind: "rack", points: 12 }, "BULL"],
  ["turkey", { kind: "none" }, "TURKEY"],
  ["rabbit", { kind: "none" }, "RABBIT"],
] as const)("a %s with %o is tagged as a %s", (species, antlers, name) => {
  expect(tagName({ species, antlers })).toBe(name);
});
