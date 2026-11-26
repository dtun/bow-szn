import { huntView, toScreen, type Screen } from "./hunt-view";

const PHONE: Screen = { width: 390, height: 844, insetTop: 47, insetBottom: 34 };
const BIG_PHONE: Screen = { width: 430, height: 932, insetTop: 59, insetBottom: 34 };

test("keeps a whole number of points per world pixel", () => {
  expect(huntView(PHONE).scale).toBe(2);
  expect(huntView(BIG_PHONE).scale).toBe(2);
});

test("spans the whole screen in world pixels, so no row or column is left bare", () => {
  expect(huntView(PHONE).bounds).toEqual({ left: -7, top: -85, right: 188, bottom: 337 });
  expect(huntView(BIG_PHONE).bounds).toEqual({ left: -17, top: -129, right: 198, bottom: 337 });
});

test("rests the bottom of the world, where the stand is, on the home indicator", () => {
  let view = huntView(PHONE);

  expect(view.safeBottom).toBe(320);
  expect(view.safeTop).toBe(-61);
});

test("a short screen with no room to spare puts the world at the top", () => {
  let view = huntView({ width: 360, height: 640, insetTop: 0, insetBottom: 0 });

  expect(view.bounds).toEqual({ left: 0, top: 0, right: 180, bottom: 320 });
});

test("maps a world point to the screen through the overscan", () => {
  let view = huntView(PHONE);

  expect(toScreen(view, { x: 0, y: 0 })).toEqual({ x: 14, y: 170 });
  expect(toScreen(view, { x: -7, y: -85 })).toEqual({ x: 0, y: 0 });
});
