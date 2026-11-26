import { worldScale } from "./world-scale";

test("fits an iPhone-sized window at the largest whole number scale", () => {
  expect(worldScale(402, 874)).toBe(2);
});

test("fits the world exactly at 1x and 2x", () => {
  expect(worldScale(180, 320)).toBe(1);
  expect(worldScale(360, 640)).toBe(2);
});

test("is limited by the tighter axis", () => {
  expect(worldScale(360, 2000)).toBe(2);
  expect(worldScale(2000, 640)).toBe(2);
});

test("rounds down rather than overflowing the window", () => {
  expect(worldScale(539, 959)).toBe(2);
  expect(worldScale(540, 960)).toBe(3);
});

test("never drops below 1x in a window smaller than the world", () => {
  expect(worldScale(100, 100)).toBe(1);
});
