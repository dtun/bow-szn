import { titleAmbience, type TitleAmbience } from "./title-ambience";

const PHONE_COLS = 98;
const SMALL_COLS = 60;
const SEEDS = [1, 7, 42, 20260101, 987654321];
const SECOND = 1000;
const SAMPLE_MS = 50;
const DOE_CYCLE_MS = 14000;
const DOE_WIDTH = 18;
const CLOUD_WIDTH = 18;
const RABBIT_WIDTH = 14;
const DOE_HOME = 59;
const DOE_STEP_CELLS = 2;

type Sample = { tMs: number; ambience: TitleAmbience };

function scan(seed: number, cols: number, endMs: number, stepMs: number = SAMPLE_MS): Sample[] {
  let samples: Sample[] = [];
  for (let tMs = 0; tMs < endMs; tMs += stepMs) {
    samples.push({ tMs, ambience: titleAmbience(tMs, seed, cols) });
  }
  return samples;
}

function rabbitAppearances(samples: Sample[]): Sample[][] {
  let appearances: Sample[][] = [];
  let previousSeen = false;
  for (let sample of samples) {
    let seen = sample.ambience.rabbit !== null;
    if (seen && !previousSeen) {
      appearances.push([]);
    }
    if (seen) {
      appearances[appearances.length - 1].push(sample);
    }
    previousSeen = seen;
  }
  return appearances;
}

function withoutRepeats<T>(items: T[]): T[] {
  return items.filter((item, index) => index === 0 || item !== items[index - 1]);
}

describe("clouds", () => {
  test("start where the still dawn paints them, each on its own lane of sky", () => {
    expect(titleAmbience(0, 1, PHONE_COLS).clouds).toEqual([
      { x: 6, down: 0.1 },
      { x: 51, down: 0.62 },
    ]);
  });

  test("drift to the right, the high one a little quicker than the low one", () => {
    let later = titleAmbience(20 * SECOND, 1, PHONE_COLS).clouds;

    expect(later.map((cloud) => cloud.x)).toEqual([6 + 18, 51 + 12]);
  });

  test("do not depend on the seed", () => {
    expect(titleAmbience(33 * SECOND, 1, PHONE_COLS).clouds).toEqual(
      titleAmbience(33 * SECOND, 987654321, PHONE_COLS).clouds
    );
  });

  test.each([0, 1])("cloud %i leaves past the right edge and re-enters from the left", (index) => {
    let xs = scan(1, PHONE_COLS, 400 * SECOND, SECOND).map(
      ({ ambience }) => ambience.clouds[index].x
    );
    let wraps = xs.flatMap((x, at) => (at > 0 && x < xs[at - 1] ? [[xs[at - 1], x]] : []));

    expect(wraps.length).toBeGreaterThanOrEqual(1);
    for (let [before, after] of wraps) {
      expect(before).toBe(PHONE_COLS - 1);
      expect(after).toBe(-CLOUD_WIDTH);
    }
    expect(Math.min(...xs)).toBe(-CLOUD_WIDTH);
    expect(Math.max(...xs)).toBe(PHONE_COLS - 1);
  });
});

describe("the doe", () => {
  test.each(SEEDS)("opens grazing at home facing the sun, whatever the seed (%i)", (seed) => {
    expect(titleAmbience(0, seed, PHONE_COLS).doe).toEqual({
      frame: "doe-graze",
      x: DOE_HOME,
      facing: 1,
    });
  });

  test.each(SEEDS)("grazes without moving for the first two seconds (%i)", (seed) => {
    for (let { ambience } of scan(seed, PHONE_COLS, 2 * SECOND)) {
      expect(ambience.doe).toEqual({ frame: "doe-graze", x: DOE_HOME, facing: 1 });
    }
  });

  test.each(SEEDS)(
    "lifts her head once, then takes a few steps, then grazes again (%i)",
    (seed) => {
      let cycle = scan(seed, PHONE_COLS, DOE_CYCLE_MS);
      let frames = withoutRepeats(cycle.map(({ ambience }) => ambience.doe.frame));
      let steps = frames.slice(3, -1);

      expect(frames.slice(0, 3)).toEqual(["doe-graze", "doe-walk-1", "doe-graze"]);
      expect(frames[frames.length - 1]).toBe("doe-graze");
      expect(steps.length).toBeGreaterThanOrEqual(3);
      expect(steps.length).toBeLessThanOrEqual(5);
      steps.forEach((frame, index) => {
        expect(frame).toBe(index % 2 === 0 ? "doe-walk-1" : "doe-walk-2");
      });
    }
  );

  test.each(SEEDS)("stays put while her head is up (%i)", (seed) => {
    let cycle = scan(seed, PHONE_COLS, DOE_CYCLE_MS);
    let firstLookAt = cycle.findIndex(({ ambience }) => ambience.doe.frame === "doe-walk-1");
    let looking = cycle
      .slice(firstLookAt)
      .filter((_, index) => index < 10)
      .map(({ ambience }) => ambience.doe.x);

    expect(new Set(looking)).toEqual(new Set([DOE_HOME]));
  });

  test.each(SEEDS)(
    "walks right a few cells, turns, and walks back to where she started (%i)",
    (seed) => {
      let first = scan(seed, PHONE_COLS, DOE_CYCLE_MS);
      let stepsTaken = withoutRepeats(first.map(({ ambience }) => ambience.doe.frame)).slice(
        3,
        -1
      ).length;
      let afterFirst = titleAmbience(DOE_CYCLE_MS, seed, PHONE_COLS).doe;
      let afterSecond = titleAmbience(2 * DOE_CYCLE_MS, seed, PHONE_COLS).doe;

      expect(titleAmbience(DOE_CYCLE_MS - 1, seed, PHONE_COLS).doe.facing).toBe(1);
      expect(afterFirst.x).toBe(DOE_HOME + stepsTaken * DOE_STEP_CELLS);
      expect(afterFirst.facing).toBe(-1);
      expect(afterSecond.x).toBe(DOE_HOME);
      expect(afterSecond.facing).toBe(-1);
      expect(titleAmbience(3 * DOE_CYCLE_MS, seed, PHONE_COLS).doe.facing).toBe(1);
    }
  );

  test("different seeds pace her day differently", () => {
    let paces = SEEDS.map((seed) =>
      scan(seed, PHONE_COLS, DOE_CYCLE_MS)
        .map(({ ambience }) => ambience.doe.frame)
        .join()
    );

    expect(new Set(paces).size).toBeGreaterThan(1);
  });

  test("a seed always replays the same day", () => {
    expect(scan(42, PHONE_COLS, 60 * SECOND)).toEqual(scan(42, PHONE_COLS, 60 * SECOND));
  });

  test.each([PHONE_COLS, SMALL_COLS])("never walks out of a %i cell wide picture", (cols) => {
    for (let seed of SEEDS) {
      for (let { ambience } of scan(seed, cols, 3 * DOE_CYCLE_MS * 4)) {
        expect(ambience.doe.x).toBeGreaterThanOrEqual(0);
        expect(ambience.doe.x + DOE_WIDTH).toBeLessThanOrEqual(cols);
      }
    }
  });
});

describe("the rabbit", () => {
  test.each(SEEDS)("is not out for the first eight seconds (%i)", (seed) => {
    for (let { ambience } of scan(seed, PHONE_COLS, 8 * SECOND)) {
      expect(ambience.rabbit).toBeNull();
    }
  });

  test.each(SEEDS)("shows up every 8 to 15 seconds, never two at once (%i)", (seed) => {
    let appearances = rabbitAppearances(scan(seed, PHONE_COLS, 180 * SECOND));
    let starts = appearances.map((run) => run[0].tMs);

    expect(starts[0]).toBeGreaterThanOrEqual(8 * SECOND);
    expect(starts[0]).toBeLessThanOrEqual(11.5 * SECOND + SAMPLE_MS);
    expect(appearances.length).toBeGreaterThanOrEqual(11);
    starts.slice(1).forEach((start, index) => {
      let gap = start - starts[index];
      expect(gap).toBeGreaterThanOrEqual(8 * SECOND - SAMPLE_MS);
      expect(gap).toBeLessThanOrEqual(15 * SECOND + SAMPLE_MS);
    });
  });

  test.each(SEEDS)("hops across the whole picture and leaves it (%i)", (seed) => {
    let appearances = rabbitAppearances(scan(seed, PHONE_COLS, 180 * SECOND));

    for (let run of appearances) {
      let placements = run.flatMap(({ ambience }) => (ambience.rabbit ? [ambience.rabbit] : []));
      let facing = placements[0].facing;
      let along = placements.map((placement) =>
        facing === 1 ? placement.x : PHONE_COLS - RABBIT_WIDTH - placement.x
      );

      expect(new Set(placements.map((placement) => placement.facing))).toEqual(new Set([facing]));
      expect(run[run.length - 1].tMs - run[0].tMs).toBeLessThanOrEqual(4.5 * SECOND);
      expect(along[0]).toBeLessThanOrEqual(-RABBIT_WIDTH + 2);
      expect(along[along.length - 1]).toBeGreaterThanOrEqual(PHONE_COLS - 3);
      expect(along).toEqual([...along].sort((a, b) => a - b));
    }
  });

  test("some rabbits come from the left and some from the right", () => {
    let facings = new Set(
      SEEDS.flatMap((seed) =>
        rabbitAppearances(scan(seed, PHONE_COLS, 180 * SECOND)).map(
          (run) => run[0].ambience.rabbit?.facing
        )
      )
    );

    expect(facings).toEqual(new Set([1, -1]));
  });

  test("hops: gathers on the ground, stretches into the air up to three cells, and lands", () => {
    let placements = scan(7, PHONE_COLS, 60 * SECOND).flatMap(({ ambience }) =>
      ambience.rabbit ? [ambience.rabbit] : []
    );

    expect(new Set(placements.map((placement) => placement.frame))).toEqual(
      new Set(["rabbit-walk-1", "rabbit-flee", "rabbit-walk-2"])
    );
    expect(Math.max(...placements.map((placement) => placement.lift))).toBe(3);
    expect(Math.min(...placements.map((placement) => placement.lift))).toBe(0);
    expect(
      new Set(
        placements.filter((placement) => placement.lift > 0).map((placement) => placement.frame)
      )
    ).toEqual(new Set(["rabbit-flee"]));
    expect(placements.filter((placement) => placement.lift === 0).length).toBeGreaterThan(
      placements.length / 4
    );
  });

  test("crosses a small phone's picture in the same time, so it never lingers", () => {
    let appearances = rabbitAppearances(scan(7, SMALL_COLS, 60 * SECOND));

    for (let run of appearances) {
      expect(run[run.length - 1].tMs - run[0].tMs).toBeLessThanOrEqual(4.5 * SECOND);
    }
  });
});
