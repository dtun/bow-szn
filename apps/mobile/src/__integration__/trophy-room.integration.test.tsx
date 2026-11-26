import path from "path";

import { fireEvent, renderRouter, screen } from "expo-router/testing-library";

jest.mock("@/platform/journal-store", () => {
  let actual = jest.requireActual("@/platform/journal-store");
  let { SEEDED_JOURNAL } = jest.requireActual("@/features/journal/test-support/harvests");
  return { ...actual, deviceJournalStore: actual.createMemoryJournalStore(SEEDED_JOURNAL) };
});

const APP_DIR = path.resolve(__dirname, "../../app");

test("journal to trophy room: the freezer is full and the mounted bucks hang on the wall", async () => {
  let app = renderRouter(APP_DIR, { initialUrl: "/journal" });

  expect(await screen.findByTestId("journalScreen")).toBeOnTheScreen();
  expect(screen.getByTestId("freezerTotal")).toHaveTextContent("FREEZER 564 LB");

  fireEvent.press(screen.getByTestId("trophyRoomBtn"));

  expect(await screen.findByTestId("trophyRoomScreen")).toBeOnTheScreen();
  expect(app.getPathname()).toBe("/trophy-room");
  expect(screen.getByTestId("mountCard-bull-elk")).toBeOnTheScreen();
  expect(screen.getByTestId("mountCard-big-buck")).toBeOnTheScreen();
  expect(screen.getByTestId("mountCard-ridge-buck")).toBeOnTheScreen();
  expect(screen.queryByTestId("mountCard-unmounted-buck")).not.toBeOnTheScreen();
});

test("back from the trophy room returns to the journal", async () => {
  let app = renderRouter(APP_DIR, { initialUrl: "/journal" });

  fireEvent.press(await screen.findByTestId("trophyRoomBtn"));
  fireEvent.press(await screen.findByTestId("trophyRoomBackBtn"));

  expect(app.getPathname()).toBe("/journal");
  expect(screen.getByTestId("journalScreen")).toBeOnTheScreen();
});

test("back from a journal that opened first goes to the title screen", async () => {
  let app = renderRouter(APP_DIR, { initialUrl: "/journal" });

  fireEvent.press(await screen.findByTestId("journalBackBtn"));

  expect(await screen.findByTestId("titleScreen")).toBeOnTheScreen();
  expect(app.getPathname()).toBe("/");
});
