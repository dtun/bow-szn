import {
  canMount,
  freezerLb,
  mount,
  personalBests,
  recordHarvest,
  trophyRoom,
  trophyScore,
  type Harvest,
  type Journal,
} from "./index";
import { DOE, huntWith, play, shootAt } from "./test-support/hunt-scenario";

const BASE: Harvest = {
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

const DOE_HARVEST = BASE;
const SPIKE: Harvest = {
  ...BASE,
  id: "spike",
  antlers: { kind: "spike" },
  weightLb: 130,
  meatLb: 59,
};
const EIGHT_POINT: Harvest = {
  ...BASE,
  id: "eight",
  antlers: { kind: "rack", points: 8 },
  weightLb: 200,
  meatLb: 90,
};
const TEN_POINT: Harvest = {
  ...BASE,
  id: "ten",
  antlers: { kind: "rack", points: 10 },
  weightLb: 245,
  meatLb: 110,
};
const TURKEY: Harvest = { ...BASE, id: "turkey", species: "turkey", weightLb: 20, meatLb: 12 };

function journalOf(harvests: Harvest[], mountedIds: string[] = []): Journal {
  return { harvests, mountedIds };
}

describe("freezer", () => {
  test("the freezer is the meat from every harvest", () => {
    expect(freezerLb(journalOf([DOE_HARVEST, EIGHT_POINT, TURKEY]))).toBe(68 + 90 + 12);
    expect(freezerLb(journalOf([]))).toBe(0);
  });

  test("recording the same harvest twice keeps one entry", () => {
    let once = recordHarvest(journalOf([]), TURKEY);
    expect(recordHarvest(once, TURKEY)).toBe(once);
    expect(once.harvests).toEqual([TURKEY]);
  });
});

describe("mounts", () => {
  test("a doe or spike harvest can't be mounted and a rack can", () => {
    expect(canMount(DOE_HARVEST)).toBe(false);
    expect(canMount(SPIKE)).toBe(false);
    expect(canMount(EIGHT_POINT)).toBe(true);
  });

  test("mounting a rack adds it once, and mounting twice is a no-op", () => {
    let journal = journalOf([DOE_HARVEST, EIGHT_POINT]);
    let mounted = mount(journal, "eight");
    expect(mounted.mountedIds).toEqual(["eight"]);
    expect(mount(mounted, "eight")).toBe(mounted);
  });

  test("mounting a doe, a spike, or a missing harvest changes nothing", () => {
    let journal = journalOf([DOE_HARVEST, SPIKE]);
    expect(mount(journal, "doe")).toBe(journal);
    expect(mount(journal, "spike")).toBe(journal);
    expect(mount(journal, "nope")).toBe(journal);
  });

  test("a doe taken on a hunt goes to the freezer and not the wall", () => {
    let hunt = play(huntWith([DOE]), shootAt(DOE.pos));
    let harvest = hunt.harvests[0];
    let journal = recordHarvest(journalOf([]), harvest);
    expect(freezerLb(journal)).toBe(Math.round(harvest.weightLb * 0.45));
    expect(mount(journal, harvest.id)).toBe(journal);
  });

  test("the trophy score is points times ten plus a tenth of the weight", () => {
    expect(trophyScore(EIGHT_POINT)).toBe(8 * 10 + 20);
    expect(trophyScore(TEN_POINT)).toBe(10 * 10 + 25);
    expect(trophyScore(DOE_HARVEST)).toBe(15);
  });

  test("the trophy room hangs mounted racks best score first", () => {
    let journal = journalOf([DOE_HARVEST, EIGHT_POINT, TEN_POINT], ["eight", "ten"]);
    expect(trophyRoom(journal).map((harvest) => harvest.id)).toEqual(["ten", "eight"]);
  });
});

describe("personal bests", () => {
  test("each species keeps its count and best weight, points, and score", () => {
    let bests = personalBests(journalOf([DOE_HARVEST, SPIKE, EIGHT_POINT, TURKEY]));
    expect(bests).toEqual({
      whitetail: { count: 3, bestWeightLb: 200, bestPoints: 8, bestScore: 100 },
      turkey: { count: 1, bestWeightLb: 20, bestPoints: 0, bestScore: 2 },
      rabbit: null,
      elk: null,
    });
  });
});
