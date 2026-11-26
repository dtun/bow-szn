export type Landing = { pos: number; hit: boolean };

export function stuckArrows(landings: readonly Landing[]): Landing[] {
  let hits = landings.filter((landing) => landing.hit);
  let last = landings[landings.length - 1];
  return last !== undefined && !last.hit ? [...hits, last] : hits;
}
