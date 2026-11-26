import { createHunt, HUNTER_POS, TUNING, type Vec2 } from "@bow-szn/core";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { DeviceEventEmitter, Dimensions } from "react-native";
import { GestureHandlerRootView, State } from "react-native-gesture-handler";
import { fireGestureHandler, getByGestureTestId } from "react-native-gesture-handler/jest-utils";

import { huntConfigFor } from "./hunt-config";
import { HuntScreen } from "./hunt-screen";
import { worldScale } from "./world-scale";

type StandingDoe = { seed: string; pos: Vec2 };

function findStandingDoe(): StandingDoe {
  for (let seed = 1; seed < 5000; seed++) {
    let hunt = createHunt(huntConfigFor(String(seed), 0));
    let doe = hunt.animals.find(
      (animal) =>
        animal.antlers.kind === "none" &&
        animal.mode.kind === "graze" &&
        animal.mode.untilMs >= 2000 &&
        Math.abs(animal.pos.x - HUNTER_POS.x) <= 2 &&
        animal.pos.y >= 150
    );
    if (doe !== undefined && hunt.wind.strength === 0) {
      return { seed: String(seed), pos: doe.pos };
    }
  }
  throw new Error("no seed puts a doe dead ahead in calm air");
}

let standing = findStandingDoe();

let window = Dimensions.get("window");
let scale = worldScale(window.width, window.height);

function pullForRange(rangePx: number): number {
  return (rangePx * TUNING.aim.maxPullPx) / TUNING.aim.maxRangePx;
}

function pullToDoe(): number {
  return pullForRange(HUNTER_POS.y - standing.pos.y);
}

function pullToEmptyGround(): number {
  return pullForRange(30);
}

function renderHunt(seed: string) {
  render(
    <GestureHandlerRootView>
      <HuntScreen seed={seed} />
    </GestureHandlerRootView>
  );
}

function dragBackAndLetGo(pullWorldPx: number) {
  act(() => {
    fireGestureHandler(getByGestureTestId("huntPan"), [
      { state: State.BEGAN },
      { state: State.ACTIVE, translationX: 0, translationY: pullWorldPx * scale },
      { state: State.END },
    ]);
  });
}

function dragBackAndLoseTheTouch(pullWorldPx: number) {
  act(() => {
    fireGestureHandler(getByGestureTestId("huntPan"), [
      { state: State.BEGAN },
      { state: State.ACTIVE, translationX: 0, translationY: pullWorldPx * scale },
      { state: State.CANCELLED },
    ]);
  });
}

function holdBack(pullWorldPx: number) {
  let { handlerTag } = getByGestureTestId("huntPan");
  act(() => {
    DeviceEventEmitter.emit("onGestureHandlerStateChange", {
      handlerTag,
      oldState: State.UNDETERMINED,
      state: State.BEGAN,
    });
    DeviceEventEmitter.emit("onGestureHandlerStateChange", {
      handlerTag,
      oldState: State.BEGAN,
      state: State.ACTIVE,
      translationX: 0,
      translationY: pullWorldPx * scale,
    });
    DeviceEventEmitter.emit("onGestureHandlerEvent", {
      handlerTag,
      state: State.ACTIVE,
      translationX: 0,
      translationY: pullWorldPx * scale,
    });
  });
}

function letGo() {
  let { handlerTag } = getByGestureTestId("huntPan");
  act(() => {
    DeviceEventEmitter.emit("onGestureHandlerStateChange", {
      handlerTag,
      oldState: State.ACTIVE,
      state: State.END,
    });
  });
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
  renderHunt(standing.seed);

  expect(screen.getByTestId("huntScreen")).toBeOnTheScreen();
  expect(screen.queryByTestId("shotResult")).not.toBeOnTheScreen();
  expect(screen.queryByText(/POWER/)).not.toBeOnTheScreen();
});

test("shows the power while the bow is drawn and clears it on release", () => {
  renderHunt(standing.seed);

  holdBack(30);

  expect(screen.getByText("POWER 50%")).toBeOnTheScreen();

  letGo();

  expect(screen.queryByText(/POWER/)).not.toBeOnTheScreen();
});

test("an arrow loosed at a standing doe flies, then lands as a HIT!", () => {
  renderHunt(standing.seed);

  dragBackAndLetGo(pullToDoe());
  passTime(300);

  expect(screen.queryByTestId("shotResult")).not.toBeOnTheScreen();

  passTime(1000);

  expect(screen.getByTestId("shotResult")).toBeOnTheScreen();
  expect(screen.getByTestId("shotResult")).toHaveTextContent("HIT!");
});

test("an arrow that lands on empty ground is a MISS", () => {
  renderHunt(standing.seed);

  dragBackAndLetGo(pullToEmptyGround());
  passTime(1500);

  expect(screen.getByTestId("shotResult")).toHaveTextContent("MISS");
});

test("tapping the result dismisses it and the bow is ready again", () => {
  renderHunt(standing.seed);
  dragBackAndLetGo(pullToEmptyGround());
  passTime(1500);

  fireEvent.press(screen.getByTestId("shotResult"));

  expect(screen.queryByTestId("shotResult")).not.toBeOnTheScreen();

  holdBack(30);

  expect(screen.getByText("POWER 50%")).toBeOnTheScreen();
});

test("a pull inside the dead zone shoots nothing", () => {
  renderHunt(standing.seed);

  dragBackAndLetGo(5);
  passTime(2000);

  expect(screen.queryByTestId("shotResult")).not.toBeOnTheScreen();
});

test("a gesture the system cancels shoots nothing", () => {
  renderHunt(standing.seed);

  dragBackAndLoseTheTouch(pullToDoe());
  passTime(2000);

  expect(screen.queryByTestId("shotResult")).not.toBeOnTheScreen();
  expect(screen.queryByText(/POWER/)).not.toBeOnTheScreen();
});
