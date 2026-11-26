import type { HuntConfig } from "@bow-szn/core";

export type SeedParam = string | string[] | undefined;

const INTEGER = /^-?\d+$/;

const FIRST_CHOICES = {
  spot: "cedar-hollow",
  season: "early",
  difficulty: "easy",
} as const;

function seedFromParam(param: SeedParam): number | null {
  let text = Array.isArray(param) ? param[0] : param;
  return text !== undefined && INTEGER.test(text) ? Number(text) : null;
}

export function huntConfigFor(param: SeedParam, nowMs: number): HuntConfig {
  return { ...FIRST_CHOICES, seed: seedFromParam(param) ?? nowMs };
}
