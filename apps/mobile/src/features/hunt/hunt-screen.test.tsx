import { TUNING } from "@bow-szn/core";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { JournalProvider } from "@/features/journal";
import { createMemoryJournalStore, type JournalStore } from "@/platform/journal-store";
import { playSfx } from "@/platform/sfx";

import { HuntScreen } from "./hunt-screen";
import type { HuntParams } from "./hunt-config";
import { dragBackAndLetGo, dragBackAndLoseTheTouch, holdBack, letGo } from "./test-support/pan";
import { shootIntoTheDirt } from "./test-support/quiver";
import {
  PULL_TO_BUCK,
  PULL_TO_DOE,
  PULL_TO_EMPTY_GROUND,
  RUT,
  STANDING_BUCK,
  STANDING_DOE,
} from "./test-support/standing-doe";

jest.mock("@/platform/sfx", () => ({ playSfx: jest.fn(), preloadSfx: jest.fn() }));

function soundsPlayed(): string[] {
  return jest.mocked(playSfx).mock.calls.map(([id]) => id);
}

function renderHunt(params: HuntParams = { seed: STANDING_DOE.seed }): JournalStore {
  let store = createMemoryJournalStore();
  render(
    <GestureHandlerRootView>
      <JournalProvider store={store}>
        <HuntScreen {...params} />
      </JournalProvider>
    </GestureHandlerRootView>
  );
  return store;
}

function shootTheBuck(): JournalStore {
  let store = renderHunt({ ...RUT, seed: STANDING_BUCK.seed });
  dragBackAndLetGo(PULL_TO_BUCK);
  passTime(1500 + TUNING.juice.cardDelayMs + TUNING.juice.cardSlamMs);
  return store;
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

test("the hunt opens on the spot's name and no tags, with no AM clock", () => {
  renderHunt();

  expect(screen.getByText("CEDAR HOLLOW")).toBeOnTheScreen();
  expect(screen.getByText("TAGS 0")).toBeOnTheScreen();
  expect(screen.queryByText("6:00 AM")).not.toBeOnTheScreen();
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

test("the quiver tells a screen reader how many arrows are left, counting down per shot", () => {
  renderHunt();

  expect(screen.getByTestId("quiver")).toHaveAccessibleName("6 arrows left");

  dragBackAndLetGo(PULL_TO_EMPTY_GROUND);
  passTime(1500);

  expect(screen.getByTestId("quiver")).toHaveAccessibleName("5 arrows left");
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

test("a buck slams in the harvest card, with MOUNT IT", () => {
  shootTheBuck();

  expect(screen.getByTestId("harvestCard")).toHaveTextContent(
    /^BUCK!!WHITETAIL\d+ POINTS · \d+ LB/
  );
  expect(screen.getByTestId("mountBtn")).toBeOnTheScreen();
  expect(screen.getByTestId("keepHuntingBtn")).toBeOnTheScreen();
});

test("the buck card waits for the hunter, however long they look at it", () => {
  shootTheBuck();

  passTime(10_000);

  expect(screen.getByTestId("harvestCard")).toBeOnTheScreen();
});

test("MOUNT IT hangs the buck in the trophy room and goes back to hunting", () => {
  let store = shootTheBuck();

  fireEvent.press(screen.getByTestId("mountBtn"));

  expect(store.load().mountedIds).toEqual([`${STANDING_BUCK.seed}-${STANDING_BUCK.id}`]);
  expect(screen.queryByTestId("harvestCard")).not.toBeOnTheScreen();
});

test("KEEP HUNTING puts the card away without a mount", () => {
  let store = shootTheBuck();

  fireEvent.press(screen.getByTestId("keepHuntingBtn"));

  expect(screen.queryByTestId("harvestCard")).not.toBeOnTheScreen();
  expect(store.load().mountedIds).toEqual([]);
});

test("a doe gets a quick banner with her weight and meat, and no MOUNT IT", () => {
  renderHunt();

  dragBackAndLetGo(PULL_TO_DOE);
  passTime(1300);

  expect(screen.getByTestId("harvestBanner")).toHaveTextContent(
    /^DOE!\+\d+ LB MEATDOE · \d+ LBSHOT AT \d+ YDS$/
  );
  expect(screen.queryByTestId("harvestCard")).not.toBeOnTheScreen();
  expect(screen.queryByTestId("mountBtn")).not.toBeOnTheScreen();
});

test("a harvest goes into the journal the moment it happens", () => {
  let store = renderHunt();

  dragBackAndLetGo(PULL_TO_DOE);
  passTime(1300);

  expect(store.load().harvests.map((harvest) => [harvest.id, harvest.species])).toEqual([
    [`${STANDING_DOE.seed}-${STANDING_DOE.id}`, "whitetail"],
  ]);
});

test("drawing creaks the bow, and loosing twangs and whooshes with a kick in the hand", () => {
  renderHunt();

  dragBackAndLetGo(PULL_TO_EMPTY_GROUND);

  expect(soundsPlayed()).toEqual(["creak", "creak", "twang", "whoosh"]);
  expect(Haptics.impactAsync).toHaveBeenCalledWith("medium");
});

test("a harvest hits home with a success buzz", () => {
  renderHunt();

  dragBackAndLetGo(PULL_TO_DOE);
  passTime(1300);

  expect(soundsPlayed()).toContain("hit");
  expect(Haptics.notificationAsync).toHaveBeenCalledWith("success");
});
