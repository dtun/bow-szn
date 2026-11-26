import path from "path";

import { TUNING } from "@bow-szn/core";
import { router } from "expo-router";
import { act, renderRouter, screen } from "expo-router/testing-library";

import { dragBackAndLetGo, holdBack } from "@/features/hunt/test-support/pan";
import { PULL_TO_DOE, STANDING_DOE } from "@/features/hunt/test-support/standing-doe";

const APP_DIR = path.resolve(__dirname, "../../app");

function clockReads(ms: number) {
  jest.spyOn(Date, "now").mockReturnValue(ms);
}

function passTime(ms: number) {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
}

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

test("hunt, draw and release at a doe, DOE!, it clears itself, ready again", async () => {
  let app = renderRouter(APP_DIR);
  clockReads(Number(STANDING_DOE.seed));

  expect(await screen.findByTestId("titleScreen")).toBeOnTheScreen();
  act(() => {
    router.push("/hunt");
  });

  expect(await screen.findByTestId("huntScreen")).toBeOnTheScreen();
  expect(app.getPathname()).toBe("/hunt");

  dragBackAndLetGo(PULL_TO_DOE);
  passTime(1500);

  expect(screen.getByTestId("shotResult")).toHaveTextContent("DOE!");

  passTime(TUNING.juice.resultMs);

  expect(screen.queryByTestId("shotResult")).not.toBeOnTheScreen();

  holdBack(30);

  expect(screen.getByTestId("powerPanel")).toHaveAccessibilityValue({
    now: 50,
    text: "50%, steady",
  });
});

test("a hunt opened with a seed in its url plays the same whatever the clock says", async () => {
  renderRouter(APP_DIR);
  clockReads(7_000_000_000_000);

  expect(await screen.findByTestId("titleScreen")).toBeOnTheScreen();
  act(() => {
    router.push({ pathname: "/hunt", params: { seed: STANDING_DOE.seed } });
  });

  expect(await screen.findByTestId("huntScreen")).toBeOnTheScreen();

  dragBackAndLetGo(PULL_TO_DOE);
  passTime(1500);

  expect(screen.getByTestId("shotResult")).toHaveTextContent("DOE!");
});
