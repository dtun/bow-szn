import { TUNING } from "@bow-szn/core";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { HuntScreen } from "./hunt-screen";
import { dragBackAndLetGo, dragBackAndLoseTheTouch, holdBack, letGo } from "./test-support/pan";
import { shootIntoTheDirt } from "./test-support/quiver";
import { PULL_TO_DOE, PULL_TO_EMPTY_GROUND, STANDING_DOE } from "./test-support/standing-doe";

function renderHunt() {
  render(
    <GestureHandlerRootView>
      <HuntScreen seed={STANDING_DOE.seed} />
    </GestureHandlerRootView>
  );
}

function passTime(ms: number) {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const EASY_QUIVER = 6;

function watchTheWayOut() {
  return jest.spyOn(router, "dismissTo").mockImplementation(() => undefined);
}

test("opens ready to draw, with no shot result", () => {
  renderHunt();

  expect(screen.getByTestId("huntScreen")).toBeOnTheScreen();
  expect(screen.queryByTestId("shotResult")).not.toBeOnTheScreen();
  expect(screen.queryByTestId("powerPanel")).not.toBeOnTheScreen();
});

test("the top bar opens on the spot, first light, and no tags", () => {
  renderHunt();

  expect(screen.getByText("CEDAR HOLLOW")).toBeOnTheScreen();
  expect(screen.getByText("6:00 AM")).toBeOnTheScreen();
  expect(screen.getByText("TAGS 0")).toBeOnTheScreen();
});

test("shows the power while the bow is drawn and clears it on release", () => {
  renderHunt();

  holdBack(30);

  expect(screen.getByTestId("powerPanel")).toHaveTextContent("POWER50%STEADY");

  letGo();

  expect(screen.queryByTestId("powerPanel")).not.toBeOnTheScreen();
});

test("an arrow loosed at a standing doe flies, then lands as DOE!", () => {
  renderHunt();

  dragBackAndLetGo(PULL_TO_DOE);
  passTime(300);

  expect(screen.queryByTestId("shotResult")).not.toBeOnTheScreen();

  passTime(1000);

  expect(screen.getByTestId("shotResult")).toBeOnTheScreen();
  expect(screen.getByTestId("shotResult")).toHaveTextContent("DOE!");
});

test("an arrow that lands on empty ground gets a funny miss line", () => {
  renderHunt();

  dragBackAndLetGo(PULL_TO_EMPTY_GROUND);
  passTime(1500);

  expect(screen.getByTestId("shotResult")).toHaveTextContent(
    /^(WHIFF!|DIRT NAP!|SO CLOSE!|THAT \w+ SAW YOU\.)$/
  );
});

test("the result clears itself after a beat and the bow is ready again", () => {
  renderHunt();
  dragBackAndLetGo(PULL_TO_EMPTY_GROUND);
  passTime(400);

  expect(screen.getByTestId("shotResult")).toBeOnTheScreen();

  passTime(TUNING.juice.resultMs);

  expect(screen.queryByTestId("shotResult")).not.toBeOnTheScreen();

  holdBack(30);

  expect(screen.getByTestId("powerPanel")).toHaveTextContent("POWER50%STEADY");
});

test("drawing again shrugs off the result at once", () => {
  renderHunt();
  dragBackAndLetGo(PULL_TO_EMPTY_GROUND);
  passTime(400);

  holdBack(30);

  expect(screen.queryByTestId("shotResult")).not.toBeOnTheScreen();
  expect(screen.getByTestId("powerPanel")).toHaveTextContent("POWER50%STEADY");
});

test("a pull inside the dead zone shoots nothing", () => {
  renderHunt();

  dragBackAndLetGo(5);
  passTime(2000);

  expect(screen.queryByTestId("shotResult")).not.toBeOnTheScreen();
});

test("a gesture the system cancels shoots nothing", () => {
  renderHunt();

  dragBackAndLoseTheTouch(PULL_TO_DOE);
  passTime(2000);

  expect(screen.queryByTestId("shotResult")).not.toBeOnTheScreen();
  expect(screen.queryByTestId("powerPanel")).not.toBeOnTheScreen();
});

test("MAP leaves the hunt for the county map", () => {
  let dismissTo = watchTheWayOut();
  renderHunt();

  fireEvent.press(screen.getByTestId("mapBtn"));

  expect(dismissTo).toHaveBeenCalledWith("/map");
});

test("MAP stays in reach with the bow drawn", () => {
  let dismissTo = watchTheWayOut();
  renderHunt();
  holdBack(30);

  fireEvent.press(screen.getByTestId("mapBtn"));

  expect(dismissTo).toHaveBeenCalledWith("/map");
});

test("loosing the last arrow ends the hunt with the morning's tally", () => {
  renderHunt();

  shootIntoTheDirt(EASY_QUIVER - 1);

  expect(screen.queryByTestId("huntOverPanel")).not.toBeOnTheScreen();

  shootIntoTheDirt(1);

  expect(screen.getByTestId("huntOverPanel")).toHaveTextContent(
    "OUT OF ARROWSNO TAGS THIS MORNINGFREEZER0 LBHUNT AGAINMAP"
  );
});

test("MAP on the game-over panel leaves the hunt", () => {
  let dismissTo = watchTheWayOut();
  renderHunt();
  shootIntoTheDirt(EASY_QUIVER);

  fireEvent.press(screen.getByTestId("overMapBtn"));

  expect(dismissTo).toHaveBeenCalledWith("/map");
});

test("the HUD's MAP still leaves once the hunt is over", () => {
  let dismissTo = watchTheWayOut();
  renderHunt();
  shootIntoTheDirt(EASY_QUIVER);

  fireEvent.press(screen.getByTestId("mapBtn"));

  expect(dismissTo).toHaveBeenCalledWith("/map");
});

test("HUNT AGAIN starts a fresh hunt with a full quiver", () => {
  renderHunt();
  shootIntoTheDirt(EASY_QUIVER);

  fireEvent.press(screen.getByTestId("huntAgainBtn"));

  expect(screen.queryByTestId("huntOverPanel")).not.toBeOnTheScreen();

  shootIntoTheDirt(EASY_QUIVER - 1);

  expect(screen.queryByTestId("huntOverPanel")).not.toBeOnTheScreen();

  shootIntoTheDirt(1);

  expect(screen.getByTestId("huntOverPanel")).toBeOnTheScreen();
});
