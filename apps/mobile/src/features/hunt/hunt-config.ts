import {
  SPOTS,
  TUNING,
  type Difficulty,
  type HuntConfig,
  type SeasonId,
  type SpotId,
} from "@bow-szn/core";

export type HuntParam = string | string[] | undefined;

export type HuntParams = {
  seed?: HuntParam;
  spot?: HuntParam;
  season?: HuntParam;
  difficulty?: HuntParam;
};

const INTEGER = /^-?\d+$/;

const SEASON_IDS: Record<SeasonId, SeasonId> = { early: "early", rut: "rut", late: "late" };

const FIRST_CHOICES = {
  spot: "cedar-hollow",
  season: "early",
  difficulty: "easy",
} as const;

function firstOf(param: HuntParam): string | undefined {
  return Array.isArray(param) ? param[0] : param;
}

function oneOf<Choice extends string>(
  choices: readonly Choice[],
  param: HuntParam,
  fallback: Choice
): Choice {
  let text = firstOf(param);
  return choices.find((choice) => choice === text) ?? fallback;
}

function seedFromParam(param: HuntParam): number | null {
  let text = firstOf(param);
  return text !== undefined && INTEGER.test(text) ? Number(text) : null;
}

export function huntConfigFor(params: HuntParams, nowMs: number): HuntConfig {
  return {
    spot: oneOf(Object.keys(SPOTS) as SpotId[], params.spot, FIRST_CHOICES.spot),
    season: oneOf(Object.values(SEASON_IDS), params.season, FIRST_CHOICES.season),
    difficulty: oneOf(
      Object.keys(TUNING.difficulty) as Difficulty[],
      params.difficulty,
      FIRST_CHOICES.difficulty
    ),
    seed: seedFromParam(params.seed) ?? nowMs,
  };
}
