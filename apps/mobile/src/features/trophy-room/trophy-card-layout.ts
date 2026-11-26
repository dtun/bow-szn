import type { Sprite } from "@bow-szn/pixels";

export const CARD_SCALE = 3;
export const CARD_UNITS = { width: 180, height: 250 };
export const CARD_PX = {
  width: CARD_UNITS.width * CARD_SCALE,
  height: CARD_UNITS.height * CARD_SCALE,
};

export const FONT_UNITS = 8;
export const MOUNT_SCALE = 3;

const MOUNT_BOTTOM = 160;
const PLATE = { x: 8, y: 166, width: 164, height: 54 };
const PLATE_BORDER = 2;
const FIRST_BASELINE_FROM_PLATE_TOP = 14;
const LINE_SPACING = 11;
const WORDMARK_Y = 230;

export type CardLayout = {
  mount: { x: number; y: number; scale: number };
  plate: { x: number; y: number; width: number; height: number; border: number };
  textCenterX: number;
  textWidth: number;
  baselines: [number, number, number, number];
  wordmark: { x: number; y: number };
};

function centeredX(spriteWidth: number): number {
  return Math.floor((CARD_UNITS.width - spriteWidth) / 2);
}

export function cardLayout(mount: Sprite, wordmark: Sprite): CardLayout {
  let first = PLATE.y + FIRST_BASELINE_FROM_PLATE_TOP;
  return {
    mount: {
      x: centeredX(mount.w * MOUNT_SCALE),
      y: MOUNT_BOTTOM - mount.h * MOUNT_SCALE,
      scale: MOUNT_SCALE,
    },
    plate: { ...PLATE, border: PLATE_BORDER },
    textCenterX: PLATE.x + PLATE.width / 2,
    textWidth: PLATE.width - 2 * PLATE_BORDER,
    baselines: [first, first + LINE_SPACING, first + 2 * LINE_SPACING, first + 3 * LINE_SPACING],
    wordmark: { x: centeredX(wordmark.w), y: WORDMARK_Y },
  };
}
