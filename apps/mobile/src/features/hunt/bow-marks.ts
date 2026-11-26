import type { Aim, Vec2 } from "@bow-szn/core";
import { PALETTE } from "@bow-szn/pixels";

import { CREAM, RED, rect, type Mark } from "./scene-marks";

type Pixel = { x: number; y: number; color: string; key?: string };

const HEAD: Vec2 = { x: 90, y: 293 };
const CHEST: Vec2 = { x: 90, y: 297 };
const SHOULDER_PX = 6;
const GRIP_REACH = 11;
const LIMB_PX = 9;
const LIMB_REST_BEND = 2;
const LIMB_DRAW_BEND = 3;
const LIMB_STEPS = 6;
const STRING_REST = LIMB_REST_BEND;
const STRING_DRAW = 7;
const ARROW_PX = 14;
const UP_FIELD: Vec2 = { x: 0, y: -1 };

function along(from: Vec2, dir: Vec2, px: number): Vec2 {
  return { x: from.x + dir.x * px, y: from.y + dir.y * px };
}

function pixelAt(point: Vec2, color: string, key?: string): Pixel {
  return { x: Math.round(point.x), y: Math.round(point.y), color, key };
}

function line(from: Vec2, to: Vec2, color: string): Pixel[] {
  let steps = Math.max(1, Math.ceil(Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y))));
  return Array.from({ length: steps + 1 }, (_, index) =>
    pixelAt(
      {
        x: from.x + ((to.x - from.x) * index) / steps,
        y: from.y + ((to.y - from.y) * index) / steps,
      },
      color
    )
  );
}

export function bowMarks(aim: Aim | null): Mark[] {
  let dir = aim?.dir ?? UP_FIELD;
  let power = aim?.power ?? 0;
  let across = { x: -dir.y, y: dir.x };
  let grip = along(HEAD, dir, GRIP_REACH);
  let flex = LIMB_REST_BEND + LIMB_DRAW_BEND * power;
  let limb = Array.from({ length: LIMB_STEPS * 2 + 1 }, (_, index) => {
    let bend = index / LIMB_STEPS - 1;
    return along(along(grip, across, bend * LIMB_PX), dir, -flex * bend * bend);
  });
  let nock = along(grip, dir, -(STRING_REST + STRING_DRAW * power));
  let tip = along(nock, dir, ARROW_PX);
  let pixels: Pixel[] = [
    ...line(along(CHEST, across, -SHOULDER_PX), grip, PALETTE.F),
    ...line(along(CHEST, across, SHOULDER_PX), nock, PALETTE.F),
    ...line(limb[0], nock, CREAM),
    ...line(nock, limb[limb.length - 1], CREAM),
    ...limb.slice(1).flatMap((point, index) => line(limb[index], point, PALETTE.B)),
    ...line(nock, tip, PALETTE.L),
    pixelAt(grip, PALETTE.P),
    pixelAt(limb[0], PALETTE.B, "bow-limb-tip-0"),
    pixelAt(limb[limb.length - 1], PALETTE.B, "bow-limb-tip-1"),
    pixelAt(tip, PALETTE.H, "bow-arrow-tip"),
    pixelAt(nock, RED, "bow-nock"),
  ];
  let painted = new Map(pixels.map((pixel) => [`${pixel.x},${pixel.y}`, pixel]));
  return [...painted.values()].map((pixel) =>
    rect(pixel.key ?? `bow-${pixel.x}-${pixel.y}`, pixel.x, pixel.y, 1, 1, pixel.color)
  );
}
