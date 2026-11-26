import { SPOTS, trophyScore, type Harvest } from "@bow-szn/core";

export type PlateLines = {
  record: string;
  score: string;
  spot: string;
  when: string;
};

export function plateLines(harvest: Harvest): PlateLines {
  let points = harvest.antlers.kind === "rack" ? harvest.antlers.points : 0;
  return {
    record: `${points} POINTS - ${harvest.weightLb} LB`,
    score: `SCORE ${trophyScore(harvest)}`,
    spot: SPOTS[harvest.spot].name,
    when: `${harvest.season.toUpperCase()} - ${harvest.shotYards} YDS`,
  };
}
