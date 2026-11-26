import { PALETTE } from "@bow-szn/pixels";

import type { SceneRect } from "@/art/scene";

export function rect(x: number, y: number, width: number, height: number, char: string): SceneRect {
  return { x, y, width, height, color: PALETTE[char] };
}
