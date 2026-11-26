import { createPrep, prepReducer, type PrepState } from "@bow-szn/core";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { StyleSheet } from "react-native";

import { updatePreferences } from "@/platform/preferences";
import { playSfx } from "@/platform/sfx";

import { PrepScreen } from "./prep-screen";

jest.mock("@/platform/sfx");

const SEED = 424242;
const FRAME_MS = 16;
const GOLD_MARGIN = 0.02;
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

function markerIsInGold(): boolean {
  let [start, end] = reference.zone;
  return reference.markerPos >= start + GOLD_MARGIN && reference.markerPos <= end - GOLD_MARGIN;
}

function tapNow() {
  fireEvent(screen.getByTestId("prepTapArea"), "pressIn");
  reference = prepReducer(reference, { type: "tap" });
}

function tapInTheGold() {
  let waited = 0;
  while (!markerIsInGold()) {
    sweepOneFrame();
    waited++;
    if (waited > MAX_FRAMES_TO_WAIT) {
      throw new Error("the marker never reached the gold");
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

test("opens on the straw bale with no arrows in it yet", () => {
  startPrep();

  expect(screen.getByTestId("prepScreen")).toBeOnTheScreen();
  expect(screen.getByRole("header", { name: "SIGHT IN" })).toBeOnTheScreen();
  expect(screen.getByTestId("prepMessage")).toHaveTextContent("TAP TO LOOSE!");
  expect(screen.getByTestId("prepCount")).toHaveTextContent("0/3");
  expect(screen.getByLabelText("0 arrows in the bale")).toBeOnTheScreen();
});

test("the whole screen is one big button for the tap", () => {
  startPrep();

  expect(
    screen.getByRole("button", { name: "Loose an arrow when the pin is in the gold" })
  ).toBeOnTheScreen();
});

test("prints every word at 12 points or bigger", () => {
  startPrep();
  tapNow();

  let smallest = Math.min(
    ...screen.getAllByText(/./).map((text) => StyleSheet.flatten(text.props.style)?.fontSize ?? 0)
  );

  expect(smallest).toBeGreaterThanOrEqual(12);
});

test("an arrow in the gold counts, sticks in the bale, and is a clean shot", () => {
  startPrep();

  tapInTheGold();

  expect(screen.getByTestId("prepCount")).toHaveTextContent("1/3");
  expect(screen.getByTestId("prepMessage")).toHaveTextContent("CLEAN SHOT!");
  expect(screen.getByLabelText("1 arrow in the bale")).toBeOnTheScreen();
});

test("the second arrow in the gold is grouped", () => {
  startPrep();

  tapInTheGold();
  tapInTheGold();

  expect(screen.getByTestId("prepCount")).toHaveTextContent("2/3");
  expect(screen.getByTestId("prepMessage")).toHaveTextContent("GROUPED!");
});

test("an arrow outside the gold is a flier that counts nothing but still sticks", () => {
  startPrep();

  tapNow();

  expect(screen.getByTestId("prepMessage")).toHaveTextContent("FLIER!");
  expect(screen.getByTestId("prepCount")).toHaveTextContent("0/3");
  expect(screen.getByLabelText("1 arrow in the bale")).toBeOnTheScreen();
});

test("a flier after a good arrow keeps the good arrow", () => {
  startPrep();
  tapInTheGold();

  tapNow();

  expect(screen.getByTestId("prepMessage")).toHaveTextContent("FLIER!");
  expect(screen.getByTestId("prepCount")).toHaveTextContent("1/3");
  expect(screen.getByLabelText("2 arrows in the bale")).toBeOnTheScreen();
});

test("a tap where the last good arrow landed is a flier, because the face moved on", () => {
  startPrep();
  let [staleStart, staleEnd] = reference.zone;
  tapInTheGold();
  expect(reference.markerPos).toBeGreaterThanOrEqual(staleStart);
  expect(reference.markerPos).toBeLessThanOrEqual(staleEnd);
  expect(markerIsInGold()).toBe(false);

  tapNow();

  expect(screen.getByTestId("prepMessage")).toHaveTextContent("FLIER!");
  expect(screen.getByTestId("prepCount")).toHaveTextContent("1/3");
});

test("a flier is pulled from the bale when the next arrow is shot", () => {
  startPrep();
  tapNow();

  tapInTheGold();

  expect(screen.getByLabelText("1 arrow in the bale")).toBeOnTheScreen();
});

test("three arrows in the gold dial the sight in", () => {
  startPrep();

  tapInTheGold();
  tapInTheGold();
  tapInTheGold();

  expect(screen.getByTestId("prepCount")).toHaveTextContent("3/3");
  expect(screen.getByTestId("prepMessage")).toHaveTextContent("DIALED IN!");
  expect(screen.getByLabelText("3 arrows in the bale")).toBeOnTheScreen();
});

test("every tap ticks the phone, and good arrows and fliers sound different", () => {
  startPrep();

  tapNow();
  tapInTheGold();

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

    tapInTheGold();
    tapInTheGold();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();

    tapInTheGold();
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.notificationAsync).toHaveBeenCalledWith("success");
  });

  test("holds on DIALED IN! for a beat, then starts the hunt on its own", () => {
    let replace = replaceSpy();
    updatePreferences({ spot: "miller-bottoms", season: "late" });
    startPrep();

    tapInTheGold();
    tapInTheGold();
    tapInTheGold();
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

    tapInTheGold();
    tapInTheGold();
    passTime(5000);

    expect(replace).not.toHaveBeenCalled();
  });

  test("extra taps once dialed in change nothing and start the hunt once", () => {
    let replace = replaceSpy();
    startPrep();
    tapInTheGold();
    tapInTheGold();
    tapInTheGold();

    fireEvent(screen.getByTestId("prepTapArea"), "pressIn");
    passTime(1000);

    expect(screen.getByTestId("prepCount")).toHaveTextContent("3/3");
    expect(screen.getByTestId("prepMessage")).toHaveTextContent("DIALED IN!");
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(3);
    expect(replace).toHaveBeenCalledTimes(1);
  });

  test("leaving the screen before the beat ends cancels the automatic start", () => {
    let replace = replaceSpy();
    startPrep();
    tapInTheGold();
    tapInTheGold();
    tapInTheGold();

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

  test("goes to the county map when sighting in was opened directly", () => {
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
