import { canMount, freezerLb, trophyScore } from "./journal";
import type { Journal } from "./types";

export const LEADERBOARDS = {
  bestBuck: "bowseason.best_buck",
  freezerTotal: "bowseason.freezer_total",
} as const;

export type LeaderboardId = (typeof LEADERBOARDS)[keyof typeof LEADERBOARDS];

export type LeaderboardScores = Partial<Record<LeaderboardId, number>>;

export function leaderboardScores(journal: Journal): LeaderboardScores {
  let scores: LeaderboardScores = {};
  let racks = journal.harvests.filter(canMount);
  if (racks.length > 0) {
    scores[LEADERBOARDS.bestBuck] = Math.max(...racks.map(trophyScore));
  }
  if (journal.harvests.length > 0) {
    scores[LEADERBOARDS.freezerTotal] = freezerLb(journal);
  }
  return scores;
}
