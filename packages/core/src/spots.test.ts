import { SPECIES, SPOTS, type SeasonId } from "./index";

const SEASONS: SeasonId[] = ["early", "rut", "late"];

describe("spot registry", () => {
  test("every spot has game in season in every season", () => {
    for (let spot of Object.values(SPOTS)) {
      for (let season of SEASONS) {
        let inSeason = spot.species.filter((id) => SPECIES[id].seasons.includes(season));
        expect(inSeason.length).toBeGreaterThan(0);
      }
    }
  });
});
