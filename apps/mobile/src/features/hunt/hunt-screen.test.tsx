import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { HuntScreen } from "./hunt-screen";
import { dragBackAndLetGo, dragBackAndLoseTheTouch, holdBack, letGo } from "./test-support/pan";
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
});

test("opens ready to draw, with no shot result", () => {
  renderHunt();

  expect(screen.getByTestId("huntScreen")).toBeOnTheScreen();
  expect(screen.queryByTestId("shotResult")).not.toBeOnTheScreen();
  expect(screen.queryByText(/POWER/)).not.toBeOnTheScreen();
});

test("shows the power while the bow is drawn and clears it on release", () => {
  renderHunt();

  holdBack(30);

  expect(screen.getByText("POWER 50%")).toBeOnTheScreen();

  letGo();

  expect(screen.queryByText(/POWER/)).not.toBeOnTheScreen();
});

test("an arrow loosed at a standing doe flies, then lands as a HIT!", () => {
  renderHunt();

  dragBackAndLetGo(PULL_TO_DOE);
  passTime(300);

  expect(screen.queryByTestId("shotResult")).not.toBeOnTheScreen();

  passTime(1000);

  expect(screen.getByTestId("shotResult")).toBeOnTheScreen();
  expect(screen.getByTestId("shotResult")).toHaveTextContent("HIT!");
});

test("an arrow that lands on empty ground is a MISS", () => {
  renderHunt();

  dragBackAndLetGo(PULL_TO_EMPTY_GROUND);
  passTime(1500);

  expect(screen.getByTestId("shotResult")).toHaveTextContent("MISS");
});

test("tapping the result dismisses it and the bow is ready again", () => {
  renderHunt();
  dragBackAndLetGo(PULL_TO_EMPTY_GROUND);
  passTime(1500);

  fireEvent.press(screen.getByTestId("shotResult"));

  expect(screen.queryByTestId("shotResult")).not.toBeOnTheScreen();

  holdBack(30);

  expect(screen.getByText("POWER 50%")).toBeOnTheScreen();
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
  expect(screen.queryByText(/POWER/)).not.toBeOnTheScreen();
});
