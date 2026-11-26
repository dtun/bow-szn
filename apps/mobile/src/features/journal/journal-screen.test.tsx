import type { Journal, SpeciesId } from "@bow-szn/core";
import { fireEvent, render, screen, within } from "@testing-library/react-native";

import { createMemoryJournalStore } from "@/platform/journal-store";

import { JournalProvider } from "./journal-provider";
import { JournalScreen } from "./journal-screen";
import { DOE, EMPTY_JOURNAL, SEEDED_JOURNAL } from "./test-support/harvests";

const ALL_SPECIES: SpeciesId[] = ["whitetail", "elk", "turkey", "rabbit"];

function renderJournal(journal: Journal) {
  render(
    <JournalProvider store={createMemoryJournalStore(journal)}>
      <JournalScreen />
    </JournalProvider>
  );
}

function card(species: SpeciesId) {
  return within(screen.getByTestId(`speciesCard-${species}`));
}

describe("an empty journal", () => {
  beforeEach(() => renderJournal(EMPTY_JOURNAL));

  test("shows an empty freezer", () => {
    expect(screen.getByTestId("freezerTotal")).toHaveTextContent("FREEZER 0 LB");
  });

  test.each(ALL_SPECIES)("keeps the %s card locked with no numbers on it", (species) => {
    expect(screen.getByTestId(`speciesCard-${species}`)).toBeDisabled();
    expect(card(species).getByText("?????")).toBeOnTheScreen();
    expect(card(species).getByText("LOCKED")).toBeOnTheScreen();
    expect(card(species).queryByText(/HARVESTED/)).not.toBeOnTheScreen();
  });

  test("says in words that a locked card is locked", () => {
    expect(screen.getByTestId("speciesCard-whitetail")).toHaveAccessibleName(
      "whitetail, locked. Harvest one to unlock it."
    );
  });

  test("offers the trophy room and a way back", () => {
    expect(screen.getByTestId("trophyRoomBtn")).toHaveTextContent("TROPHY ROOM");
    expect(screen.getByTestId("journalBackBtn")).toHaveTextContent("BACK");
  });
});

describe("a journal with harvests", () => {
  beforeEach(() => renderJournal(SEEDED_JOURNAL));

  test("adds up the meat of every harvest in the freezer", () => {
    expect(screen.getByTestId("freezerTotal")).toHaveTextContent("FREEZER 564 LB");
  });

  test("counts four whitetails, the heaviest at 200 lb, the best rack at 10 points", () => {
    expect(card("whitetail").getByText("WHITETAIL")).toBeOnTheScreen();
    expect(card("whitetail").getByText("HARVESTED 4")).toBeOnTheScreen();
    expect(card("whitetail").getByText("HEAVIEST 200 LB")).toBeOnTheScreen();
    expect(card("whitetail").getByText("BEST RACK 10 PTS")).toBeOnTheScreen();
  });

  test("counts one elk at 600 lb with a 14 point rack", () => {
    expect(card("elk").getByText("HARVESTED 1")).toBeOnTheScreen();
    expect(card("elk").getByText("HEAVIEST 600 LB")).toBeOnTheScreen();
    expect(card("elk").getByText("BEST RACK 14 PTS")).toBeOnTheScreen();
  });

  test("counts one turkey at 20 lb with no rack line", () => {
    expect(card("turkey").getByText("HARVESTED 1")).toBeOnTheScreen();
    expect(card("turkey").getByText("HEAVIEST 20 LB")).toBeOnTheScreen();
    expect(card("turkey").queryByText(/RACK/)).not.toBeOnTheScreen();
  });

  test("counts two rabbits, the heaviest at 4 lb", () => {
    expect(card("rabbit").getByText("HARVESTED 2")).toBeOnTheScreen();
    expect(card("rabbit").getByText("HEAVIEST 4 LB")).toBeOnTheScreen();
  });

  test("reads a card out loud with its numbers", () => {
    expect(screen.getByTestId("speciesCard-whitetail")).toHaveAccessibleName(
      "whitetail. 4 harvested. Heaviest 200 pounds. Best rack 10 points."
    );
  });

  test("opens a species into its harvests, newest first, and nothing from other species", () => {
    fireEvent.press(screen.getByTestId("speciesCard-whitetail"));

    expect(screen.getAllByTestId(/^journalEntry-/).map((entry) => entry.props.testID)).toEqual([
      "journalEntry-unmounted-buck",
      "journalEntry-ridge-buck",
      "journalEntry-doe",
      "journalEntry-big-buck",
    ]);
    expect(screen.queryByTestId("speciesCard-whitetail")).not.toBeOnTheScreen();
  });

  test("lists a mounted buck with its spot, season, clock time, yards, weight, and meat", () => {
    fireEvent.press(screen.getByTestId("speciesCard-whitetail"));

    let entry = within(screen.getByTestId("journalEntry-big-buck"));
    expect(entry.getByText("10 PT BUCK - MOUNTED")).toBeOnTheScreen();
    expect(entry.getByText("MILLER BOTTOMS - RUT")).toBeOnTheScreen();
    expect(entry.getByText("7:42 AM - 32 YDS")).toBeOnTheScreen();
    expect(entry.getByText("200 LB - 90 LB MEAT")).toBeOnTheScreen();
  });

  test("lists a doe and an unmounted buck without the mounted tag", () => {
    fireEvent.press(screen.getByTestId("speciesCard-whitetail"));

    let doe = within(screen.getByTestId("journalEntry-doe"));
    expect(doe.getByText("DOE")).toBeOnTheScreen();
    expect(doe.getByText("CEDAR HOLLOW - EARLY")).toBeOnTheScreen();
    expect(doe.getByText("6:15 AM - 25 YDS")).toBeOnTheScreen();
    expect(doe.getByText("120 LB - 54 LB MEAT")).toBeOnTheScreen();

    let buck = within(screen.getByTestId("journalEntry-unmounted-buck"));
    expect(buck.getByText("8 PT BUCK")).toBeOnTheScreen();
    expect(buck.getByText("CATTAIL MARSH - EARLY")).toBeOnTheScreen();
    expect(buck.getByText("8:00 AM - 28 YDS")).toBeOnTheScreen();
    expect(buck.getByText("180 LB - 81 LB MEAT")).toBeOnTheScreen();
  });

  test("shows an afternoon harvest on a 12 hour clock", () => {
    fireEvent.press(screen.getByTestId("speciesCard-rabbit"));

    let entry = within(screen.getByTestId("journalEntry-small-rabbit"));
    expect(entry.getByText("RABBIT")).toBeOnTheScreen();
    expect(entry.getByText("CEDAR HOLLOW - LATE")).toBeOnTheScreen();
    expect(entry.getByText("12:05 PM - 9 YDS")).toBeOnTheScreen();
    expect(entry.getByText("2 LB - 1 LB MEAT")).toBeOnTheScreen();
  });

  test("goes back from a species to all the cards", () => {
    fireEvent.press(screen.getByTestId("speciesCard-elk"));
    fireEvent.press(screen.getByTestId("harvestListCloseBtn"));

    expect(screen.queryByTestId("harvestList")).not.toBeOnTheScreen();
    expect(screen.getByTestId("speciesCard-elk")).toBeOnTheScreen();
    expect(screen.getByTestId("speciesCard-rabbit")).toBeOnTheScreen();
  });
});

test("a species with only a doe shows no rack yet", () => {
  renderJournal({ harvests: [DOE], mountedIds: [] });

  expect(card("whitetail").getByText("NO RACK YET")).toBeOnTheScreen();
  expect(card("whitetail").queryByText(/BEST RACK/)).not.toBeOnTheScreen();
  expect(screen.getByTestId("freezerTotal")).toHaveTextContent("FREEZER 54 LB");
});
