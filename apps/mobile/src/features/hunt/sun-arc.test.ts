import { huntView, type Screen } from "./hunt-view";
import type { Mark } from "./scene-marks";
import { shortClock, sunArc } from "./sun-arc";

const PHONE: Screen = { width: 390, height: 844, insetTop: 47, insetBottom: 34 };
const PRO: Screen = { width: 402, height: 874, insetTop: 62, insetBottom: 34 };
const SE: Screen = { width: 375, height: 667, insetTop: 20, insetBottom: 0 };
const SIX = 360;
const EIGHT = 480;
const TEN = 600;

function sunCenter(marks: Mark[]): { x: number; y: number } {
  let rows = marks.filter((mark) => /^sun-\d+$/.test(mark.key));
  let widest = rows.reduce((best, mark) =>
    mark.kind === "rect" && best.kind === "rect" && mark.width > best.width ? mark : best
  );
  if (widest.kind !== "rect") {
    throw new Error("the sun is drawn from rects");
  }
  return { x: widest.x + (widest.width - 1) / 2, y: widest.y };
}

function trackDots(marks: Mark[]): number {
  return marks.filter((mark) => mark.key.startsWith("sun-track-")).length;
}

test.each([
  [360, "6:00"],
  [363.9, "6:03"],
  [585, "9:45"],
  [600, "10:00"],
  [720, "12:00"],
])("%p minutes after midnight reads %p beside the sun", (clockMin, text) => {
  expect(shortClock(clockMin)).toBe(text);
});

test.each([
  ["390x844", PHONE],
  ["402x874", PRO],
])(
  "on a %s phone the sun climbs left to right off the treeline as the morning passes",
  (_, screen) => {
    let view = huntView(screen);
    let dawn = sunCenter(sunArc(SIX, view).marks);
    let mid = sunCenter(sunArc(EIGHT, view).marks);
    let end = sunCenter(sunArc(TEN, view).marks);

    expect(dawn.x).toBeLessThan(mid.x);
    expect(mid.x).toBeLessThan(end.x);
    expect(dawn.y).toBeGreaterThan(mid.y);
    expect(mid.y).toBeGreaterThan(end.y);
    expect(dawn.y).toBeGreaterThan(-26);
  }
);

test("the sun never climbs into the MAP and quiver row", () => {
  let view = huntView(PHONE);
  let tops = [SIX, 420, EIGHT, 540, TEN].flatMap((clockMin) =>
    sunArc(clockMin, view).marks.map((mark) => (mark.kind === "rect" ? mark.y : 0))
  );

  expect(Math.min(...tops)).toBeGreaterThanOrEqual(view.safeTop + 15);
});

test("the path the sun has left to climb is dotted, and it shortens as the morning passes", () => {
  let view = huntView(PHONE);

  expect(trackDots(sunArc(SIX, view).marks)).toBe(25);
  expect(trackDots(sunArc(EIGHT, view).marks)).toBeLessThan(25);
  expect(trackDots(sunArc(TEN, view).marks)).toBe(0);
});

test("the sun shows the time only in the last 15 minutes of the morning", () => {
  let view = huntView(PHONE);

  expect(sunArc(584, view).labels).toEqual([]);
  expect(sunArc(585, view).labels.map((each) => each.text)).toEqual(["9:45"]);
  expect(sunArc(599, view).labels.map((each) => each.text)).toEqual(["9:59"]);
});

test("a phone with no sky above the trees shows the time in the HUD row instead", () => {
  let arc = sunArc(363, huntView(SE));

  expect(arc.marks).toEqual([]);
  expect(arc.labels.map((each) => each.text)).toEqual(["6:03"]);
});
