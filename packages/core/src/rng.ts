export type Roller = {
  float(): number;
  between(min: number, max: number): number;
  int(min: number, max: number): number;
  chance(probability: number): boolean;
  pick<T>(items: readonly T[], weightOf: (item: T) => number): T;
  state(): number;
};

const STATE_STEP = 0x6d2b79f5;
const UINT32_RANGE = 4294967296;

export function createRoller(seed: number): Roller {
  let current = seed | 0;

  function float(): number {
    current = (current + STATE_STEP) | 0;
    let t = Math.imul(current ^ (current >>> 15), 1 | current);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / UINT32_RANGE;
  }

  function between(min: number, max: number): number {
    return min + float() * (max - min);
  }

  function int(min: number, max: number): number {
    return min + Math.floor(float() * (max - min + 1));
  }

  function chance(probability: number): boolean {
    return float() < probability;
  }

  function pick<T>(items: readonly T[], weightOf: (item: T) => number): T {
    let weighted = items.filter((item) => weightOf(item) > 0);
    let total = weighted.reduce((sum, item) => sum + weightOf(item), 0);
    let roll = float() * total;
    for (let item of weighted) {
      roll -= weightOf(item);
      if (roll < 0) {
        return item;
      }
    }
    return weighted[weighted.length - 1];
  }

  function state(): number {
    return current;
  }

  return { float, between, int, chance, pick, state };
}
