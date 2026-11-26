import { SPRITES } from "@bow-szn/pixels";

import { ambientLayer } from "./ambient-layer";
import { CLOUD } from "./dawn-cloud";
import type { TitleAmbience } from "./title-ambience";

const PHONE = { horizonRow: 68, skyTopRow: 30 };
const TALL_PHONE = { horizonRow: 101, skyTopRow: 42 };
const SHORT_PHONE = { horizonRow: 100, skyTopRow: 40 };
const CLOUD_HEIGHT = 3;

const AT_REST: TitleAmbience = {
  clouds: [
    { x: 6, down: 0.1 },
    { x: 51, down: 0.62 },
  ],
  doe: { frame: "doe-graze", x: 59, facing: 1 },
  rabbit: null,
};

function mirrorOf(rows: readonly string[]): string[] {
  return rows.map((row) => [...row].reverse().join(""));
}

test("paints each cloud at its place in the clear sky, between the tagline and the sun", () => {
  let { sprites } = ambientLayer(AT_REST, PHONE);

  expect(sprites[0]).toEqual({ sprite: CLOUD, x: 6, y: 33 });
  expect(sprites[1]).toEqual({ sprite: CLOUD, x: 51, y: 38 });
});

test.each([PHONE, SHORT_PHONE, TALL_PHONE])(
  "keeps a cloud at any place in the sky below the tagline and clear of the sun, on a $rows row picture",
  (geometry) => {
    let places = [0, 0.25, 0.5, 0.75, 1].map((down) => {
      let layer = ambientLayer({ ...AT_REST, clouds: [{ x: 10, down }] }, geometry);
      return layer.sprites[0].y;
    });

    for (let top of places) {
      expect(top).toBeGreaterThanOrEqual(geometry.skyTopRow + 2);
      expect(top + CLOUD_HEIGHT).toBeLessThanOrEqual(geometry.horizonRow - 24);
    }
  }
);

test("a cloud drifts along one row of sky, so only its column changes", () => {
  let first = ambientLayer({ ...AT_REST, clouds: [{ x: 10, down: 0.62 }] }, TALL_PHONE);
  let later = ambientLayer({ ...AT_REST, clouds: [{ x: 40, down: 0.62 }] }, TALL_PHONE);

  expect(later.sprites[0].y).toBe(first.sprites[0].y);
});

test("a doe facing right is the sprite as drawn, standing with her hooves 14 rows under the horizon", () => {
  let { sprites } = ambientLayer(AT_REST, PHONE);

  expect(sprites[2]).toEqual({ sprite: SPRITES["doe-graze"], x: 59, y: 68 + 14 - 9 });
});

test("a taller pose keeps her hooves on the same row", () => {
  let walking: TitleAmbience = { ...AT_REST, doe: { frame: "doe-walk-1", x: 61, facing: 1 } };

  let { sprites } = ambientLayer(walking, PHONE);

  expect(sprites[2]).toEqual({ sprite: SPRITES["doe-walk-1"], x: 61, y: 68 + 14 - 14 });
});

test("a doe facing left is the sprite mirrored, in the same place", () => {
  let turned: TitleAmbience = { ...AT_REST, doe: { frame: "doe-graze", x: 59, facing: -1 } };

  let { sprites } = ambientLayer(turned, PHONE);
  let original = SPRITES["doe-graze"];

  expect(sprites[2].sprite.rows).toEqual(mirrorOf(original.rows));
  expect(sprites[2].sprite.w).toBe(original.w);
  expect(sprites[2].sprite.h).toBe(original.h);
  expect(sprites[2].x).toBe(59);
  expect(sprites[2].y).toBe(68 + 14 - 9);
});

test("there is no rabbit in the picture until one is out", () => {
  expect(ambientLayer(AT_REST, PHONE).sprites).toHaveLength(3);
});

test("a hopping rabbit is drawn last, on top, with its feet lifted by the hop", () => {
  let hopping: TitleAmbience = {
    ...AT_REST,
    rabbit: { frame: "rabbit-flee", x: 40, lift: 3, facing: 1 },
  };

  let { sprites } = ambientLayer(hopping, PHONE);

  expect(sprites).toHaveLength(4);
  expect(sprites[3]).toEqual({ sprite: SPRITES["rabbit-flee"], x: 40, y: 93 - 8 - 3 });
});

test("a rabbit on the ground stands with its feet on the grass, 25 rows under the horizon", () => {
  let landed: TitleAmbience = {
    ...AT_REST,
    rabbit: { frame: "rabbit-walk-1", x: 20, lift: 0, facing: 1 },
  };

  let { sprites } = ambientLayer(landed, PHONE);

  expect(sprites[3].y + sprites[3].sprite.h).toBe(68 + 25);
});

test("a rabbit running left is mirrored", () => {
  let running: TitleAmbience = {
    ...AT_REST,
    rabbit: { frame: "rabbit-walk-2", x: 70, lift: 0, facing: -1 },
  };

  let { sprites } = ambientLayer(running, PHONE);

  expect(sprites[3].sprite.rows).toEqual(mirrorOf(SPRITES["rabbit-walk-2"].rows));
  expect(sprites[3].x).toBe(70);
});

test("the rabbit's feet follow the horizon, so it always runs on the grass above the license", () => {
  let landed: TitleAmbience = {
    ...AT_REST,
    rabbit: { frame: "rabbit-walk-1", x: 20, lift: 0, facing: 1 },
  };

  let tall = ambientLayer(landed, TALL_PHONE).sprites[3];

  expect(tall.y + tall.sprite.h).toBe(101 + 25);
});
