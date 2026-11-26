import { colorAt } from "@/art/test-support/color-at";

import {
  baleScene,
  BALE_ROWS,
  goldFace,
  PATH_ROW,
  pinScene,
  sightBackdrop,
  swayPosition,
} from "./sight-scene";

const INNER_GOLD = "#f7d44a";
const OUTER_GOLD = "#d9a73a";
const RED_RING = "#e23b3b";
const GOLD = [INNER_GOLD, OUTER_GOLD];
const STRAW = ["#c9a36b", "#e6d3a3", "#9c7a45", "#5a3a1e", "#8b5a2f"];
const GRASS = ["#3e8e2f", "#5fae3a", "#2d6b24"];
const SKY_BLUE = "#2b6cd9";
const BASE_SHADOW = "#1d4a22";
const ARROW_SHAFT = "#f4efe1";
const PIN_CENTER = "#e23b3b";
const ZONE: readonly [number, number] = [0.5, 0.72];

function paintedAt(zone: readonly [number, number], markerPos: number, landings = []) {
  return [...baleScene(zone, landings), ...pinScene(markerPos)];
}

function goldColumns(zone: readonly [number, number]): number {
  let layers = baleScene(zone, []);
  return [...Array(80).keys()].filter((column) =>
    GOLD.includes(colorAt(layers, column, PATH_ROW) ?? "")
  ).length;
}

describe("the sway path", () => {
  test("runs across the bale with room for the face's rim at each end", () => {
    expect(swayPosition(0)).toBe(5);
    expect(swayPosition(0.5)).toBe(40);
    expect(swayPosition(1)).toBe(75);
  });

  test("the pin sits on it at the marker's place", () => {
    expect(colorAt(pinScene(0), 5, PATH_ROW)).toBe(PIN_CENTER);
    expect(colorAt(pinScene(0.5), 40, PATH_ROW)).toBe(PIN_CENTER);
    expect(colorAt(pinScene(1), 75, PATH_ROW)).toBe(PIN_CENTER);
  });

  test("the pin is five cells across, centered on its place", () => {
    let layers = pinScene(0.5);

    expect(colorAt(layers, 38, PATH_ROW)).not.toBeNull();
    expect(colorAt(layers, 42, PATH_ROW)).not.toBeNull();
    expect(colorAt(layers, 37, PATH_ROW)).toBeNull();
    expect(colorAt(layers, 43, PATH_ROW)).toBeNull();
  });
});

describe("the gold rings", () => {
  test("are centered on the zone, as wide as the zone is across the path", () => {
    let face = goldFace(ZONE);

    expect(face.centerX).toBeCloseTo(swayPosition(0.61));
    expect(face.radius).toBeCloseTo((0.22 * 70) / 2);
  });

  test("are drawn where the zone sits and nowhere else on the path", () => {
    let layers = baleScene(ZONE, []);

    expect(GOLD).toContain(colorAt(layers, 47, PATH_ROW));
    expect(GOLD).not.toContain(colorAt(layers, 20, PATH_ROW));
    expect(GOLD).not.toContain(colorAt(layers, 70, PATH_ROW));
  });

  test("ring the gold in red, and the red in dark ink", () => {
    let layers = baleScene(ZONE, []);

    expect(colorAt(layers, 38, PATH_ROW)).toBe(RED_RING);
    expect(colorAt(layers, 37, PATH_ROW)).toBe("#3a2414");
  });

  test.each([
    [0.5, 0.72],
    [0.1, 0.3],
    [0.78, 1],
    [0, 0.154],
  ] as const)(
    "the pin is over gold exactly when the marker is inside the zone %d to %d",
    (start, end) => {
      let margin = 0.02;
      let layers = baleScene([start, end], []);
      let markerPositions = Array.from({ length: 101 }, (_, step) => step / 100);
      let inside = markerPositions.filter((pos) => pos >= start + margin && pos <= end - margin);
      let outside = markerPositions.filter((pos) => pos < start - margin || pos > end + margin);
      function underPin(pos: number): string {
        return colorAt(layers, Math.floor(swayPosition(pos)), PATH_ROW) ?? "";
      }

      expect(inside.length).toBeGreaterThan(0);
      expect(inside.filter((pos) => !GOLD.includes(underPin(pos)))).toEqual([]);
      expect(outside.filter((pos) => GOLD.includes(underPin(pos)))).toEqual([]);
    }
  );

  test("a narrower zone makes a smaller gold bullseye", () => {
    expect(goldColumns([0.4, 0.554])).toBeLessThan(goldColumns([0.4, 0.675]));
  });
});

describe("the bale", () => {
  test("is straw and twine behind the face", () => {
    expect(STRAW).toContain(colorAt(baleScene(ZONE, []), 10, 30));
  });

  test("casts a shadow on the grass at its base", () => {
    expect(colorAt(baleScene(ZONE, []), 40, BALE_ROWS + 1)).toBe(BASE_SHADOW);
    expect(colorAt(baleScene(ZONE, []), 40, BALE_ROWS + 4)).toBeNull();
  });
});

describe("the backdrop", () => {
  let COLS = 83;
  let ROWS = 180;
  let HORIZON = 63;
  let GROUND = 115;
  let layers = sightBackdrop(COLS, ROWS, HORIZON, GROUND);

  test("is sky at the top and grass at the very bottom, edge to edge", () => {
    expect(colorAt(layers, 0, 0)).toBe(SKY_BLUE);
    expect(colorAt(layers, COLS - 1, 0)).toBe(SKY_BLUE);
    expect(GRASS).toContain(colorAt(layers, 0, ROWS - 1));
    expect(GRASS).toContain(colorAt(layers, COLS - 1, ROWS - 1));
  });

  test("has a low sun on the horizon", () => {
    expect(colorAt(layers, Math.round(COLS * 0.68), HORIZON - 10)).toBe("#f7d44a");
  });

  test("dots only the field below the bale with grass blades", () => {
    let blades = layers[1].rects;

    expect(blades.length).toBeGreaterThan(0);
    expect(blades.filter((blade) => blade.y < GROUND)).toEqual([]);
    expect(blades.filter((blade) => blade.y + blade.height > ROWS)).toEqual([]);
  });
});

describe("the stuck arrows", () => {
  test("none at first", () => {
    expect(colorAt(paintedAt(ZONE, 0.9), 40, PATH_ROW - 3)).not.toBe(ARROW_SHAFT);
  });

  test("a good arrow sticks out of the bale where the pin was", () => {
    let layers = baleScene(ZONE, [{ pos: 0.5, hit: true }]);

    expect(colorAt(layers, 40, PATH_ROW - 1)).toBe(ARROW_SHAFT);
    expect(colorAt(layers, 40, PATH_ROW - 8)).toBe(ARROW_SHAFT);
    expect(colorAt(layers, 41, PATH_ROW - 1)).not.toBe(ARROW_SHAFT);
  });

  test("three good arrows all stay stuck", () => {
    let layers = baleScene(ZONE, [
      { pos: 0.1, hit: true },
      { pos: 0.5, hit: true },
      { pos: 0.9, hit: true },
    ]);

    expect(colorAt(layers, 12, PATH_ROW - 1)).toBe(ARROW_SHAFT);
    expect(colorAt(layers, 40, PATH_ROW - 1)).toBe(ARROW_SHAFT);
    expect(colorAt(layers, 68, PATH_ROW - 1)).toBe(ARROW_SHAFT);
  });

  test("a flier sticks outside the gold until the next shot", () => {
    let flier = { pos: 0.05, hit: false };

    expect(colorAt(baleScene(ZONE, [flier]), 8, PATH_ROW - 1)).toBe(ARROW_SHAFT);
    expect(colorAt(baleScene(ZONE, [flier, { pos: 0.6, hit: true }]), 8, PATH_ROW - 1)).not.toBe(
      ARROW_SHAFT
    );
  });
});

describe("the one live face", () => {
  let FIRST_ZONE = [0.4, 0.62] as const;
  let NEXT_ZONE = [0.7, 0.92] as const;
  let hitInFirstZone = { pos: 0.5, hit: true };
  let firstFaceColumn = Math.floor(goldFace(FIRST_ZONE).centerX);
  let nextFaceColumn = Math.floor(goldFace(NEXT_ZONE).centerX);

  test("the face a good arrow hit is gone once the zone moves on", () => {
    let layers = baleScene(NEXT_ZONE, [hitInFirstZone]);

    expect(STRAW).toContain(colorAt(layers, firstFaceColumn, PATH_ROW + 6));
    expect(GOLD).not.toContain(colorAt(layers, firstFaceColumn, PATH_ROW));
  });

  test("the good arrow stays stuck where it hit, with no face under it", () => {
    let layers = baleScene(NEXT_ZONE, [hitInFirstZone]);

    expect(colorAt(layers, 40, PATH_ROW - 1)).toBe(ARROW_SHAFT);
    expect(GOLD).not.toContain(colorAt(layers, 40, PATH_ROW + 1));
  });

  test("the live face keeps its bright gold", () => {
    let layers = baleScene(NEXT_ZONE, [hitInFirstZone]);

    expect(colorAt(layers, nextFaceColumn, PATH_ROW)).toBe(INNER_GOLD);
  });

  test("a flier leaves no face behind", () => {
    let layers = baleScene(NEXT_ZONE, [{ pos: 0.5, hit: false }]);

    expect(GOLD).not.toContain(colorAt(layers, 42, PATH_ROW));
  });

  test("no face is drawn once the sight is dialed in", () => {
    let layers = baleScene(null, [hitInFirstZone]);

    expect(colorAt(layers, nextFaceColumn, PATH_ROW)).not.toBe(INNER_GOLD);
    expect(GOLD).not.toContain(colorAt(layers, firstFaceColumn, PATH_ROW));
  });
});
