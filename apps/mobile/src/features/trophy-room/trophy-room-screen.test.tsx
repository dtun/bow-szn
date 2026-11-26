import type { Journal } from "@bow-szn/core";
import { render, screen, within } from "@testing-library/react-native";

import { JournalProvider } from "@/features/journal";
import {
  BIG_BUCK,
  DOE,
  EMPTY_JOURNAL,
  SEEDED_JOURNAL,
} from "@/features/journal/test-support/harvests";
import { createMemoryJournalStore } from "@/platform/journal-store";

import { TrophyRoomScreen } from "./trophy-room-screen";

function renderTrophyRoom(journal: Journal) {
  render(
    <JournalProvider store={createMemoryJournalStore(journal)}>
      <TrophyRoomScreen />
    </JournalProvider>
  );
}

function mountIds(): string[] {
  return screen.queryAllByTestId(/^mountCard-/).map((mount) => mount.props.testID);
}

test("a journal with nothing mounted shows a bare wall with the message", () => {
  renderTrophyRoom(EMPTY_JOURNAL);

  expect(screen.getByTestId("trophyRoomEmpty")).toHaveTextContent(
    "NO MOUNTS YET. BUCKS CAN BE MOUNTED FROM THE HARVEST CARD."
  );
  expect(mountIds()).toEqual([]);
});

test("harvests that were never mounted leave the wall bare", () => {
  renderTrophyRoom({ harvests: [BIG_BUCK, DOE], mountedIds: [] });

  expect(screen.getByTestId("trophyRoomEmpty")).toBeOnTheScreen();
  expect(mountIds()).toEqual([]);
});

describe("a journal with three mounted bucks", () => {
  beforeEach(() => renderTrophyRoom(SEEDED_JOURNAL));

  test("hangs only the mounted bucks, best score first", () => {
    expect(mountIds()).toEqual([
      "mountCard-bull-elk",
      "mountCard-big-buck",
      "mountCard-ridge-buck",
    ]);
  });

  test("leaves the doe, the unmounted buck, the turkey, and the rabbits off the wall", () => {
    expect(screen.queryByTestId("mountCard-doe")).not.toBeOnTheScreen();
    expect(screen.queryByTestId("mountCard-unmounted-buck")).not.toBeOnTheScreen();
    expect(screen.queryByTestId("mountCard-turkey")).not.toBeOnTheScreen();
    expect(screen.queryByTestId("mountCard-rabbit")).not.toBeOnTheScreen();
    expect(screen.queryByTestId("trophyRoomEmpty")).not.toBeOnTheScreen();
  });

  test("puts the elk's points, weight, score, spot, season, and yards on its brass plate", () => {
    let plate = within(screen.getByTestId("brassPlate-bull-elk"));

    expect(plate.getByText("14 POINTS - 600 LB")).toBeOnTheScreen();
    expect(plate.getByText("SCORE 200")).toBeOnTheScreen();
    expect(plate.getByText("HIGH RIDGE")).toBeOnTheScreen();
    expect(plate.getByText("RUT - 55 YDS")).toBeOnTheScreen();
  });

  test("puts the ten point whitetail's numbers on its brass plate", () => {
    let plate = within(screen.getByTestId("brassPlate-big-buck"));

    expect(plate.getByText("10 POINTS - 200 LB")).toBeOnTheScreen();
    expect(plate.getByText("SCORE 120")).toBeOnTheScreen();
    expect(plate.getByText("MILLER BOTTOMS")).toBeOnTheScreen();
    expect(plate.getByText("RUT - 32 YDS")).toBeOnTheScreen();
  });

  test("puts the six point whitetail's numbers on its brass plate", () => {
    let plate = within(screen.getByTestId("brassPlate-ridge-buck"));

    expect(plate.getByText("6 POINTS - 160 LB")).toBeOnTheScreen();
    expect(plate.getByText("SCORE 76")).toBeOnTheScreen();
    expect(plate.getByText("HIGH RIDGE")).toBeOnTheScreen();
    expect(plate.getByText("LATE - 40 YDS")).toBeOnTheScreen();
  });

  test("describes each mount in words", () => {
    expect(
      within(screen.getByTestId("mountCard-big-buck")).getByRole("image")
    ).toHaveAccessibleName("Mounted 10 point whitetail from miller bottoms");
  });

  test("offers a way back", () => {
    expect(screen.getByTestId("trophyRoomBackBtn")).toHaveTextContent("BACK");
  });
});
