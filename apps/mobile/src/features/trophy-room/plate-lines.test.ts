import { BIG_BUCK, BULL_ELK, RIDGE_BUCK } from "@/features/journal/test-support/harvests";

import { plateLines } from "./plate-lines";

test("a ten point whitetail plate reads points, weight, score, spot, season, and yards", () => {
  expect(plateLines(BIG_BUCK)).toEqual({
    record: "10 POINTS - 200 LB",
    score: "SCORE 120",
    spot: "MILLER BOTTOMS",
    when: "RUT - 32 YDS",
  });
});

test("a smaller late-season buck scores its points times ten plus a tenth of its weight", () => {
  expect(plateLines(RIDGE_BUCK)).toEqual({
    record: "6 POINTS - 160 LB",
    score: "SCORE 76",
    spot: "HIGH RIDGE",
    when: "LATE - 40 YDS",
  });
});

test("a bull elk plate counts its total points", () => {
  expect(plateLines(BULL_ELK)).toEqual({
    record: "14 POINTS - 600 LB",
    score: "SCORE 200",
    spot: "HIGH RIDGE",
    when: "RUT - 55 YDS",
  });
});
