import { fireEvent, render, screen } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";

import { createMemoryJournalStore } from "@/platform/journal-store";

import { JournalProvider, useJournal } from "./journal-provider";
import { BIG_BUCK, DOE, EMPTY_JOURNAL, SEEDED_JOURNAL } from "./test-support/harvests";

function Probe() {
  let { journal, record, mount } = useJournal();

  return (
    <>
      <Text testID="harvestIds">{journal.harvests.map((harvest) => harvest.id).join(",")}</Text>
      <Text testID="mountedIds">{journal.mountedIds.join(",")}</Text>
      <Pressable testID="recordBuckBtn" onPress={() => record(BIG_BUCK)} />
      <Pressable testID="recordDoeBtn" onPress={() => record(DOE)} />
      <Pressable testID="mountBuckBtn" onPress={() => mount(BIG_BUCK.id)} />
      <Pressable testID="mountDoeBtn" onPress={() => mount(DOE.id)} />
    </>
  );
}

function renderProbe(store = createMemoryJournalStore(EMPTY_JOURNAL)) {
  render(
    <JournalProvider store={store}>
      <Probe />
    </JournalProvider>
  );
  return store;
}

test("starts from what the store has kept", () => {
  renderProbe(createMemoryJournalStore(SEEDED_JOURNAL));

  expect(screen.getByTestId("harvestIds")).toHaveTextContent(
    "big-buck,doe,ridge-buck,unmounted-buck,bull-elk,turkey,rabbit,small-rabbit"
  );
  expect(screen.getByTestId("mountedIds")).toHaveTextContent("ridge-buck,big-buck,bull-elk");
});

test("a recorded harvest shows up and is saved to the store", () => {
  let store = renderProbe();

  fireEvent.press(screen.getByTestId("recordBuckBtn"));

  expect(screen.getByTestId("harvestIds")).toHaveTextContent("big-buck");
  expect(store.load()).toEqual({ harvests: [BIG_BUCK], mountedIds: [] });
});

test("recording the same harvest twice keeps one entry and saves once", () => {
  let store = createMemoryJournalStore(EMPTY_JOURNAL);
  let save = jest.spyOn(store, "save");
  renderProbe(store);

  fireEvent.press(screen.getByTestId("recordBuckBtn"));
  fireEvent.press(screen.getByTestId("recordBuckBtn"));

  expect(screen.getByTestId("harvestIds")).toHaveTextContent("big-buck");
  expect(store.load().harvests).toEqual([BIG_BUCK]);
  expect(save).toHaveBeenCalledTimes(1);
});

test("mounting a recorded buck saves it as mounted", () => {
  let store = renderProbe();

  fireEvent.press(screen.getByTestId("recordBuckBtn"));
  fireEvent.press(screen.getByTestId("mountBuckBtn"));

  expect(screen.getByTestId("mountedIds")).toHaveTextContent("big-buck");
  expect(store.load()).toEqual({ harvests: [BIG_BUCK], mountedIds: ["big-buck"] });
});

test("mounting twice, a doe, or a harvest nobody recorded changes nothing and saves nothing", () => {
  let store = createMemoryJournalStore(EMPTY_JOURNAL);
  let save = jest.spyOn(store, "save");
  renderProbe(store);

  fireEvent.press(screen.getByTestId("mountBuckBtn"));
  fireEvent.press(screen.getByTestId("recordBuckBtn"));
  fireEvent.press(screen.getByTestId("recordDoeBtn"));
  fireEvent.press(screen.getByTestId("mountDoeBtn"));
  fireEvent.press(screen.getByTestId("mountBuckBtn"));
  fireEvent.press(screen.getByTestId("mountBuckBtn"));

  expect(screen.getByTestId("mountedIds")).toHaveTextContent("big-buck");
  expect(store.load().mountedIds).toEqual(["big-buck"]);
  expect(save).toHaveBeenCalledTimes(3);
});

test("a journal in the store survives the provider being rendered again", () => {
  let store = renderProbe();
  fireEvent.press(screen.getByTestId("recordBuckBtn"));
  screen.unmount();

  renderProbe(store);

  expect(screen.getByTestId("harvestIds")).toHaveTextContent("big-buck");
});

test("useJournal outside a provider says what is missing", () => {
  jest.spyOn(console, "error").mockImplementation(() => {});

  expect(() => render(<Probe />)).toThrow("useJournal needs a JournalProvider above it.");
});
