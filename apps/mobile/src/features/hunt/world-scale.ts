import { WORLD_H, WORLD_W } from "@bow-szn/core";

export function worldScale(width: number, height: number): number {
  return Math.max(1, Math.floor(Math.min(width / WORLD_W, height / WORLD_H)));
}
