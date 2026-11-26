import { leaderboardScores, type Harvest, type Journal } from "./index";

const DOE: Harvest = {
  id: "doe",
  species: "whitetail",
  antlers: { kind: "none" },
  weightLb: 150,
  meatLb: 68,
  spot: "cedar-hollow",
  season: "early",
  clockMin: 400,
  shotYards: 30,
};
const HEAVY_SPIKE: Harvest = {
  ...DOE,
  id: "spike",
  antlers: { kind: "spike" },
  weightLb: 260,
  meatLb: 117,
};
const EIGHT_POINT: Harvest = {
  ...DOE,
  id: "eight",
  antlers: { kind: "rack", points: 8 },
  weightLb: 200,
  meatLb: 90,
};
const TEN_POINT: Harvest = {
  ...DOE,
  id: "ten",
  antlers: { kind: "rack", points: 10 },
  weightLb: 240,
  meatLb: 108,
};
const BULL_ELK: Harvest = {
  ...DOE,
  id: "elk",
  species: "elk",
  antlers: { kind: "rack", points: 14 },
  weightLb: 610,
  meatLb: 256,
};
const TURKEY: Harvest = { ...DOE, id: "turkey", species: "turkey", weightLb: 20, meatLb: 12 };

function journalOf(harvests: Harvest[], mountedIds: string[] = []): Journal {
  return { harvests, mountedIds };
}

test("an empty journal has no score on either board", () => {
  expect(leaderboardScores(journalOf([]))).toEqual({});
});

test("does, spikes, and turkeys fill the freezer board and leave the buck board empty", () => {
  expect(leaderboardScores(journalOf([DOE, HEAVY_SPIKE, TURKEY]))).toEqual({
    "bowseason.freezer_total": 68 + 117 + 12,
  });
});

test("the buck board takes the best rack score, mounted or not", () => {
  let journal = journalOf([DOE, EIGHT_POINT, TEN_POINT], ["eight"]);

  expect(leaderboardScores(journal)).toEqual({
    "bowseason.best_buck": 10 * 10 + 24,
    "bowseason.freezer_total": 68 + 90 + 108,
  });
});

test("a bull elk's rack counts on the buck board", () => {
  expect(leaderboardScores(journalOf([TEN_POINT, BULL_ELK]))).toEqual({
    "bowseason.best_buck": 14 * 10 + 61,
    "bowseason.freezer_total": 108 + 256,
  });
});
