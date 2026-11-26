import { sceneGrid } from "./title-layout";

test("a phone's sky is about 90 cells across, each a whole number of points wide", () => {
  expect(sceneGrid({ width: 390, height: 450 })).toEqual({ cell: 4, cols: 98, rows: 113 });
});

test("a tablet gets bigger cells, so the picture stays about 90 cells across", () => {
  expect(sceneGrid({ width: 820, height: 1180 })).toEqual({ cell: 9, cols: 92, rows: 132 });
});

test("a very narrow screen never gets cells smaller than 3 points", () => {
  expect(sceneGrid({ width: 200, height: 300 })).toEqual({ cell: 3, cols: 67, rows: 100 });
});
