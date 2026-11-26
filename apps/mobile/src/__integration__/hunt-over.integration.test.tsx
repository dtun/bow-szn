import path from "path";

import { router } from "expo-router";
import { act, fireEvent, renderRouter, screen } from "expo-router/testing-library";

import { shootIntoTheDirt } from "@/features/hunt/test-support/quiver";
import { STANDING_DOE } from "@/features/hunt/test-support/standing-doe";

const APP_DIR = path.resolve(__dirname, "../../app");
const EASY_QUIVER = 6;

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test("an emptied quiver ends the hunt, HUNT AGAIN refills it, and MAP leaves", async () => {
  let app = renderRouter(APP_DIR);
  expect(await screen.findByTestId("titleScreen")).toBeOnTheScreen();
  act(() => {
    router.push({ pathname: "/hunt", params: { seed: STANDING_DOE.seed } });
  });
  expect(await screen.findByTestId("huntScreen")).toBeOnTheScreen();

  shootIntoTheDirt(EASY_QUIVER);

  expect(screen.getByTestId("huntOverPanel")).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId("huntAgainBtn"));
  shootIntoTheDirt(EASY_QUIVER - 1);

  expect(screen.queryByTestId("huntOverPanel")).not.toBeOnTheScreen();

  shootIntoTheDirt(1);

  expect(screen.getByTestId("huntOverPanel")).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId("overMapBtn"));

  expect(await screen.findByTestId("mapScreen")).toBeOnTheScreen();
  expect(app.getPathname()).toBe("/map");
});
