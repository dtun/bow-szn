import { MOUNT_FRAMES, SPRITES } from "@bow-szn/pixels";

import {
  BIG_BUCK,
  BULL_ELK,
  RIDGE_BUCK,
  UNMOUNTED_BUCK,
} from "@/features/journal/test-support/harvests";

import { mountSprite } from "./mount-sprite";
import { plateLines } from "./plate-lines";
import { CARD_PX, CARD_SCALE, CARD_UNITS, FONT_UNITS, cardLayout } from "./trophy-card-layout";

const WORDMARK = SPRITES["logo-wordmark"];
const MOUNTS = Object.values(MOUNT_FRAMES).map((id) => SPRITES[id]);

test("the card is the card units at a whole number of pixels per unit", () => {
  expect(CARD_PX).toEqual({ width: 540, height: 750 });
  expect(CARD_UNITS.width * CARD_SCALE).toBe(CARD_PX.width);
  expect(CARD_UNITS.height * CARD_SCALE).toBe(CARD_PX.height);
});

describe.each(MOUNTS)("the card around $name", (mount) => {
  let layout = cardLayout(mount, WORDMARK);

  test("keeps the mount on the card, centered, on whole units", () => {
    expect(Number.isInteger(layout.mount.x) && Number.isInteger(layout.mount.y)).toBe(true);
    expect(layout.mount.x).toBeGreaterThanOrEqual(0);
    expect(layout.mount.y).toBeGreaterThanOrEqual(0);
    expect(layout.mount.x + mount.w * layout.mount.scale).toBeLessThanOrEqual(CARD_UNITS.width);
    expect(
      Math.abs(2 * layout.mount.x + mount.w * layout.mount.scale - CARD_UNITS.width)
    ).toBeLessThanOrEqual(1);
  });

  test("stands the mount on the plate without overlapping it", () => {
    expect(layout.mount.y + mount.h * layout.mount.scale).toBeLessThanOrEqual(layout.plate.y);
  });

  test("keeps the plate and the wordmark on the card, the wordmark under the plate", () => {
    expect(layout.plate.x + layout.plate.width).toBeLessThanOrEqual(CARD_UNITS.width);
    expect(layout.plate.y + layout.plate.height).toBeLessThanOrEqual(layout.wordmark.y);
    expect(layout.wordmark.y + WORDMARK.h).toBeLessThanOrEqual(CARD_UNITS.height);
    expect(layout.wordmark.x).toBeGreaterThanOrEqual(0);
    expect(layout.wordmark.x + WORDMARK.w).toBeLessThanOrEqual(CARD_UNITS.width);
  });

  test("sets four lines of text inside the plate", () => {
    let [first, , , last] = layout.baselines;

    expect(first - FONT_UNITS).toBeGreaterThanOrEqual(layout.plate.y + layout.plate.border);
    expect(last).toBeLessThanOrEqual(layout.plate.y + layout.plate.height - layout.plate.border);
  });
});

test("the longest plate line of any buck still fits across the plate", () => {
  let layout = cardLayout(mountSprite(BIG_BUCK), WORDMARK);

  for (let harvest of [BIG_BUCK, BULL_ELK, RIDGE_BUCK, UNMOUNTED_BUCK]) {
    for (let line of Object.values(plateLines(harvest))) {
      expect(line.length * FONT_UNITS).toBeLessThanOrEqual(layout.textWidth);
    }
  }
});
