import { spriteRuns } from "@/art/sprite-runs";
import type { SceneLayer } from "@/art/scene";

export function colorAt(layers: SceneLayer[], x: number, y: number): string | null {
  let painted: string | null = null;
  for (let layer of layers) {
    for (let rect of layer.rects) {
      if (x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height) {
        painted = rect.color;
      }
    }
    for (let placed of layer.sprites) {
      for (let run of spriteRuns(placed.sprite)) {
        let runY = placed.y + run.y;
        if (y === runY && x >= placed.x + run.x && x < placed.x + run.x + run.width) {
          painted = run.color;
        }
      }
    }
  }
  return painted;
}
