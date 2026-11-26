import { SPECIES, type SeasonId } from "./index";

const SEASONS: SeasonId[] = ["early", "rut", "late"];

describe("species registry", () => {
  test("every antlered species rolls doe, spike, or buck with odds that sum to one", () => {
    let totals = Object.values(SPECIES).flatMap((species) => {
      let headgear = species.headgear;
      return headgear.kind === "antlered"
        ? SEASONS.map((season) => {
            let odds = headgear.odds[season];
            return Math.round((odds.doe + odds.spike + odds.buck) * 1000) / 1000;
          })
        : [];
    });
    expect(totals).toEqual([1, 1, 1, 1, 1, 1]);
  });

  test("the rut doubles buck odds over the early season", () => {
    let headgear = SPECIES.whitetail.headgear;
    let odds = headgear.kind === "antlered" ? headgear.odds : null;
    expect(odds?.rut.buck).toBe((odds?.early.buck ?? 0) * 2);
  });

  test("only whitetail and elk grow antlers", () => {
    let antlered = Object.values(SPECIES)
      .filter((species) => species.headgear.kind === "antlered")
      .map((species) => species.id);
    expect(antlered).toEqual(["whitetail", "elk"]);
  });
});
