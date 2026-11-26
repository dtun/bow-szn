import type { Harvest } from "@bow-szn/core";

import { harvestCardFor } from "./harvest-card";

const BUCK: Harvest = {
  id: "9-4",
  species: "whitetail",
  antlers: { kind: "rack", points: 8 },
  weightLb: 184,
  meatLb: 83,
  spot: "miller-bottoms",
  season: "rut",
  clockMin: 402,
  shotYards: 32,
};

const DOE: Harvest = {
  ...BUCK,
  id: "9-5",
  antlers: { kind: "none" },
  weightLb: 132,
  meatLb: 59,
  shotYards: 41,
};

test("a buck's card reads its rack, weight, meat, and the shot, and offers a mount", () => {
  expect(harvestCardFor(BUCK)).toEqual({
    harvestId: "9-4",
    title: "BUCK!!",
    name: "WHITETAIL",
    classLine: "8 POINTS · 184 LB",
    meatLine: "+83 LB MEAT",
    shotLine: "SHOT AT 32 YDS",
    canMount: true,
    sprite: "buck-medium-walk-1",
  });
});

test("a doe's card names the doe and offers no mount", () => {
  expect(harvestCardFor(DOE)).toEqual({
    harvestId: "9-5",
    title: "DOE!",
    name: "WHITETAIL",
    classLine: "DOE · 132 LB",
    meatLine: "+59 LB MEAT",
    shotLine: "SHOT AT 41 YDS",
    canMount: false,
    sprite: "doe-walk-1",
  });
});

test("a spike is meat, not a mount", () => {
  let card = harvestCardFor({ ...DOE, antlers: { kind: "spike" } });

  expect(card).toMatchObject({ title: "SPIKE!", classLine: "SPIKE · 132 LB", canMount: false });
});

test("a bull elk is a mount, a cow is meat", () => {
  let bull = harvestCardFor({ ...BUCK, species: "elk", antlers: { kind: "rack", points: 12 } });
  let cow = harvestCardFor({ ...DOE, species: "elk", weightLb: 610 });

  expect(bull).toMatchObject({ title: "BULL!!", name: "ELK", sprite: "elk-bull-walk-1" });
  expect(cow).toMatchObject({ title: "COW!", classLine: "COW · 610 LB", canMount: false });
});

test("a turkey's card just weighs the bird", () => {
  let card = harvestCardFor({ ...DOE, species: "turkey", weightLb: 18, meatLb: 11 });

  expect(card).toMatchObject({ title: "TURKEY!", name: "TURKEY", classLine: "18 LB" });
});
