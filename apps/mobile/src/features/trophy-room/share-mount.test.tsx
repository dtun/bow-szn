import type { Harvest } from "@bow-szn/core";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { JournalProvider } from "@/features/journal";
import { BIG_BUCK, BULL_ELK, SEEDED_JOURNAL } from "@/features/journal/test-support/harvests";
import { createMemoryJournalStore } from "@/platform/journal-store";
import { FAKE_SHARE_FOLDER, createFakeSharer, type Sharer } from "@/platform/share";
import { TOAST_MS } from "@/ui/pixel-toast";

import { TrophyRoomScreen } from "./trophy-room-screen";
import { FAILED_TOAST, UNAVAILABLE_TOAST } from "./use-share-mount";
import type { CardRenderer } from "./use-card-renderer";

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function pngCards(): jest.MockedFunction<CardRenderer> {
  return jest.fn<Promise<Uint8Array>, [Harvest]>(async () => PNG);
}

function renderTrophyRoom(sharer: Sharer, renderCard: CardRenderer = pngCards()) {
  render(
    <JournalProvider store={createMemoryJournalStore(SEEDED_JOURNAL)}>
      <TrophyRoomScreen sharer={sharer} renderCard={renderCard} />
    </JournalProvider>
  );
}

afterEach(() => {
  jest.useRealTimers();
});

test("every mount has a SHARE button, and nothing unmounted does", () => {
  renderTrophyRoom(createFakeSharer());

  expect(screen.getByTestId("shareMountBtn-bull-elk")).toHaveTextContent("SHARE");
  expect(screen.getByTestId("shareMountBtn-big-buck")).toHaveTextContent("SHARE");
  expect(screen.getByTestId("shareMountBtn-ridge-buck")).toHaveTextContent("SHARE");
  expect(screen.queryByTestId("shareMountBtn-unmounted-buck")).not.toBeOnTheScreen();
});

test("names which mount a SHARE button shares", () => {
  renderTrophyRoom(createFakeSharer());

  expect(screen.getByTestId("shareMountBtn-big-buck")).toHaveAccessibleName(
    "Share the 10 point whitetail mount"
  );
  expect(screen.getByTestId("shareMountBtn-bull-elk")).toHaveAccessibleName(
    "Share the 14 point elk mount"
  );
});

test("SHARE draws a card for that buck and hands its PNG to the share sheet", async () => {
  let sharer = createFakeSharer();
  let renderCard = pngCards();
  renderTrophyRoom(sharer, renderCard);

  fireEvent.press(screen.getByTestId("shareMountBtn-big-buck"));

  await waitFor(() => expect(sharer.shared).toHaveLength(1));
  expect(renderCard).toHaveBeenCalledTimes(1);
  expect(renderCard).toHaveBeenCalledWith(BIG_BUCK);
  expect(sharer.shared).toEqual([
    { uri: `${FAKE_SHARE_FOLDER}/bow-season-big-buck.png`, bytes: PNG },
  ]);
  expect(screen.queryByTestId("shareToast")).not.toBeOnTheScreen();
});

test("sharing a different mount hands over that mount's card", async () => {
  let sharer = createFakeSharer();
  let renderCard = pngCards();
  renderTrophyRoom(sharer, renderCard);

  fireEvent.press(screen.getByTestId("shareMountBtn-bull-elk"));

  await waitFor(() => expect(sharer.shared).toHaveLength(1));
  expect(renderCard).toHaveBeenCalledWith(BULL_ELK);
  expect(sharer.shared[0].uri).toBe(`${FAKE_SHARE_FOLDER}/bow-season-bull-elk.png`);
});

test("pressing SHARE twice at once opens one share sheet, and a later press opens another", async () => {
  let sharer = createFakeSharer();
  let renderCard = pngCards();
  renderTrophyRoom(sharer, renderCard);

  fireEvent.press(screen.getByTestId("shareMountBtn-big-buck"));
  fireEvent.press(screen.getByTestId("shareMountBtn-big-buck"));

  await waitFor(() => expect(sharer.shared).toHaveLength(1));
  expect(renderCard).toHaveBeenCalledTimes(1);

  fireEvent.press(screen.getByTestId("shareMountBtn-big-buck"));

  await waitFor(() => expect(sharer.shared).toHaveLength(2));
});

test("a toast says so when sharing is not available, and nothing is shared", async () => {
  let sharer = createFakeSharer(false);
  renderTrophyRoom(sharer);

  fireEvent.press(screen.getByTestId("shareMountBtn-big-buck"));

  expect(await screen.findByTestId("shareToast")).toHaveTextContent(UNAVAILABLE_TOAST);
  expect(UNAVAILABLE_TOAST).toBe("SHARING IS NOT AVAILABLE ON THIS DEVICE.");
  expect(sharer.shared).toEqual([]);
});

test("a toast asks for another try when the card cannot be drawn", async () => {
  let sharer = createFakeSharer();
  renderTrophyRoom(
    sharer,
    jest.fn(async () => {
      throw new Error("no offscreen surface");
    })
  );

  fireEvent.press(screen.getByTestId("shareMountBtn-big-buck"));

  expect(await screen.findByTestId("shareToast")).toHaveTextContent(FAILED_TOAST);
  expect(FAILED_TOAST).toBe("COULD NOT SHARE THAT MOUNT. TRY AGAIN.");
  expect(sharer.shared).toEqual([]);
});

test("a toast asks for another try when the share sheet fails", async () => {
  let failing: Sharer = {
    async sharePng() {
      throw new Error("sheet refused");
    },
  };
  renderTrophyRoom(failing);

  fireEvent.press(screen.getByTestId("shareMountBtn-big-buck"));

  expect(await screen.findByTestId("shareToast")).toHaveTextContent(FAILED_TOAST);
});

test("the toast goes away by itself", async () => {
  jest.useFakeTimers();
  renderTrophyRoom(createFakeSharer(false));

  fireEvent.press(screen.getByTestId("shareMountBtn-big-buck"));
  expect(await screen.findByTestId("shareToast")).toBeOnTheScreen();

  act(() => {
    jest.advanceTimersByTime(TOAST_MS);
  });

  expect(screen.queryByTestId("shareToast")).not.toBeOnTheScreen();
});
