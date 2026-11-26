import { createPrep, prepReducer, type PrepState } from "@bow-szn/core";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

import { updatePreferences } from "@/platform/preferences";
import { playSfx } from "@/platform/sfx";

import { PrepScreen } from "./prep-screen";

jest.mock("@/platform/sfx");

const SEED = 424242;
const FRAME_MS = 16;
const GREEN_MARGIN = 0.02;
const MAX_FRAMES_TO_WAIT = 4000;

type FrameCallback = (nowMs: number) => void;

let scheduled = new Map<number, FrameCallback>();
let nextFrameId = 1;
let clockMs = 0;
let reference: PrepState;

function runNextFrame() {
  let [id, callback] = [...scheduled.entries()][0];
  scheduled.delete(id);
  clockMs += FRAME_MS;
  act(() => callback(clockMs));
}

function sweepOneFrame() {
  runNextFrame();
  reference = prepReducer(reference, { type: "tick", dtMs: FRAME_MS });
}

function markerIsInGreen(): boolean {
  let [start, end] = reference.zone;
  return reference.markerPos >= start + GREEN_MARGIN && reference.markerPos <= end - GREEN_MARGIN;
}

function tapNow() {
  fireEvent(screen.getByTestId("prepTapArea"), "pressIn");
  reference = prepReducer(reference, { type: "tap" });
}

function tapInTheGreen() {
  let waited = 0;
  while (!markerIsInGreen()) {
    sweepOneFrame();
    waited++;
    if (waited > MAX_FRAMES_TO_WAIT) {
      throw new Error("the marker never reached the green zone");
    }
  }
  tapNow();
}

function startPrep() {
  reference = createPrep("easy", SEED);
  render(<PrepScreen />);
  clockMs = 1000;
  act(() => [...scheduled.values()][0](clockMs));
}

beforeEach(() => {
  scheduled = new Map();
  nextFrameId = 1;
  jest.spyOn(Date, "now").mockReturnValue(SEED);
  jest.spyOn(globalThis, "requestAnimationFrame").mockImplementation((callback) => {
    let id = nextFrameId++;
    scheduled.set(id, callback);
    return id;
  });
  jest.spyOn(globalThis, "cancelAnimationFrame").mockImplementation((id) => {
    scheduled.delete(id);
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

function replaceSpy() {
  return jest.spyOn(router, "replace").mockImplementation(() => undefined);
}

function useFakeTimeoutsOnly() {
  jest.useFakeTimers({
    doNotFake: [
      "Date",
      "nextTick",
      "queueMicrotask",
      "requestAnimationFrame",
      "cancelAnimationFrame",
    ],
  });
}

function passTime(ms: number) {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
}

test("opens on the bench with nothing waxed yet", () => {
  startPrep();

  expect(screen.getByTestId("prepScreen")).toBeOnTheScreen();
  expect(screen.getByRole("header", { name: "WAX THE STRING" })).toBeOnTheScreen();
  expect(screen.getByTestId("prepMessage")).toHaveTextContent("TAP IN THE GREEN!");
  expect(screen.getByTestId("prepCount")).toHaveTextContent("(0/3)");
});

test("the whole screen is one big button for the tap", () => {
  startPrep();

  expect(
    screen.getByRole("button", { name: "Tap when the marker is in the green zone" })
  ).toBeOnTheScreen();
});

test("a tap in the green counts as a hit", () => {
  startPrep();

  tapInTheGreen();

  expect(screen.getByTestId("prepCount")).toHaveTextContent("(1/3)");
  expect(screen.getByTestId("prepMessage")).toHaveTextContent("NICE! AGAIN!");
});

test("a tap outside the green slips and counts nothing", () => {
  startPrep();

  tapNow();

  expect(screen.getByTestId("prepMessage")).toHaveTextContent("SLIPPED!");
  expect(screen.getByTestId("prepCount")).toHaveTextContent("(0/3)");
});

test("a slip after a hit keeps the hit", () => {
  startPrep();
  tapInTheGreen();

  tapNow();

  expect(screen.getByTestId("prepMessage")).toHaveTextContent("SLIPPED!");
  expect(screen.getByTestId("prepCount")).toHaveTextContent("(1/3)");
});

test("three hits wax the string", () => {
  startPrep();

  tapInTheGreen();
  tapInTheGreen();
  tapInTheGreen();

  expect(screen.getByTestId("prepCount")).toHaveTextContent("(3/3)");
  expect(screen.getByTestId("prepMessage")).toHaveTextContent("WAXED UP!");
});

test("every tap ticks the phone, and hits and slips sound different", () => {
  startPrep();

  tapNow();
  tapInTheGreen();

  expect(Haptics.impactAsync).toHaveBeenCalledTimes(2);
  expect(Haptics.impactAsync).toHaveBeenCalledWith("light");
  expect(jest.mocked(playSfx).mock.calls).toEqual([["tap-slip"], ["tap-hit"]]);
});

describe("SKIP", () => {
  test("starts the hunt at once with the saved spot, season, and level", () => {
    let replace = replaceSpy();
    updatePreferences({ spot: "high-ridge", season: "rut", difficulty: "hard" });
    startPrep();

    fireEvent.press(screen.getByTestId("skipPrepBtn"));

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith({
      pathname: "/hunt",
      params: { spot: "high-ridge", season: "rut", difficulty: "hard" },
    });
  });

  test("uses the first choices on a fresh install", () => {
    let replace = replaceSpy();
    startPrep();

    fireEvent.press(screen.getByTestId("skipPrepBtn"));

    expect(replace).toHaveBeenCalledWith({
      pathname: "/hunt",
      params: { spot: "cedar-hollow", season: "early", difficulty: "easy" },
    });
  });

  test("is announced as a button", () => {
    startPrep();

    expect(screen.getByRole("button", { name: "SKIP" })).toBeOnTheScreen();
  });
});

describe("finishing the prep", () => {
  beforeEach(() => {
    useFakeTimeoutsOnly();
  });

  test("the third hit buzzes success, and the first two do not", () => {
    startPrep();

    tapInTheGreen();
    tapInTheGreen();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();

    tapInTheGreen();
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.notificationAsync).toHaveBeenCalledWith("success");
  });

  test("holds on WAXED UP! for a beat, then starts the hunt on its own", () => {
    let replace = replaceSpy();
    updatePreferences({ spot: "miller-bottoms", season: "late" });
    startPrep();

    tapInTheGreen();
    tapInTheGreen();
    tapInTheGreen();
    expect(replace).not.toHaveBeenCalled();

    passTime(1000);

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith({
      pathname: "/hunt",
      params: { spot: "miller-bottoms", season: "late", difficulty: "easy" },
    });
  });

  test("does not start the hunt before the third hit", () => {
    let replace = replaceSpy();
    startPrep();

    tapInTheGreen();
    tapInTheGreen();
    passTime(5000);

    expect(replace).not.toHaveBeenCalled();
  });

  test("extra taps while waxed up change nothing and start the hunt once", () => {
    let replace = replaceSpy();
    startPrep();
    tapInTheGreen();
    tapInTheGreen();
    tapInTheGreen();

    fireEvent(screen.getByTestId("prepTapArea"), "pressIn");
    passTime(1000);

    expect(screen.getByTestId("prepCount")).toHaveTextContent("(3/3)");
    expect(screen.getByTestId("prepMessage")).toHaveTextContent("WAXED UP!");
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(3);
    expect(replace).toHaveBeenCalledTimes(1);
  });

  test("leaving the screen before the beat ends cancels the automatic start", () => {
    let replace = replaceSpy();
    startPrep();
    tapInTheGreen();
    tapInTheGreen();
    tapInTheGreen();

    screen.unmount();
    passTime(1000);

    expect(replace).not.toHaveBeenCalled();
  });
});

describe("BACK", () => {
  test("goes back to the screen before when there is one", () => {
    jest.spyOn(router, "canGoBack").mockReturnValue(true);
    let back = jest.spyOn(router, "back").mockImplementation(() => undefined);
    startPrep();

    fireEvent.press(screen.getByTestId("prepBackBtn"));

    expect(back).toHaveBeenCalledTimes(1);
  });

  test("goes to the county map when the bench was opened directly", () => {
    jest.spyOn(router, "canGoBack").mockReturnValue(false);
    let replace = replaceSpy();
    startPrep();

    fireEvent.press(screen.getByTestId("prepBackBtn"));

    expect(replace).toHaveBeenCalledWith("/map");
  });

  test("is announced as a button", () => {
    startPrep();

    expect(screen.getByRole("button", { name: "BACK" })).toBeOnTheScreen();
  });
});
