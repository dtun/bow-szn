import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";

import { TitleScreen } from "./title-screen";

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  useIsFocused: () => true,
}));

afterEach(() => {
  jest.restoreAllMocks();
});

test("GO HUNTING opens the county map", () => {
  let push = jest.spyOn(router, "push").mockImplementation(() => undefined);
  render(<TitleScreen />);

  fireEvent.press(screen.getByTestId("goHuntingBtn"));

  expect(push).toHaveBeenCalledTimes(1);
  expect(push).toHaveBeenCalledWith("/map");
});

test("GO HUNTING is announced as a button", () => {
  render(<TitleScreen />);

  expect(screen.getByRole("button", { name: "GO HUNTING" })).toBeOnTheScreen();
});

test("JOURNAL opens the journal", () => {
  let push = jest.spyOn(router, "push").mockImplementation(() => undefined);
  render(<TitleScreen />);

  fireEvent.press(screen.getByTestId("journalBtn"));

  expect(push).toHaveBeenCalledTimes(1);
  expect(push).toHaveBeenCalledWith("/journal");
});

test("JOURNAL is announced as a button", () => {
  render(<TitleScreen />);

  expect(screen.getByRole("button", { name: "JOURNAL" })).toBeOnTheScreen();
});

function measure(testID: string, width: number, height: number) {
  fireEvent(screen.getByTestId(testID), "layout", {
    nativeEvent: { layout: { x: 0, y: 0, width, height } },
  });
}

test("announces the game's name as the screen heading", () => {
  render(<TitleScreen />);

  expect(screen.getByTestId("titleScreen")).toBeOnTheScreen();
  expect(screen.getByRole("header", { name: "BOW SEASON" })).toBeOnTheScreen();
});

test("says what the game is under the logo", () => {
  render(<TitleScreen />);

  expect(screen.getByText("8-BIT BOW HUNTING")).toBeOnTheScreen();
});

test("offers a GO HUNTING button", () => {
  render(<TitleScreen />);

  expect(screen.getByTestId("goHuntingBtn")).toBeOnTheScreen();
  expect(screen.getByTestId("goHuntingBtn")).toHaveTextContent("GO HUNTING");
});

test("paints the dawn once the screen knows how big its sky is", async () => {
  render(<TitleScreen />);

  expect(screen.queryByTestId("dawnScene")).not.toBeOnTheScreen();

  measure("titleScene", 390, 450);

  expect(await screen.findByTestId("dawnScene")).toBeOnTheScreen();
  expect(screen.getByTestId("dawnAmbience")).toBeOnTheScreen();
});

describe("level", () => {
  test("starts on easy and cycles medium, hard, then back to easy", () => {
    render(<TitleScreen />);

    expect(screen.getByTestId("levelBtn")).toHaveTextContent("LEVEL: EASY");

    fireEvent.press(screen.getByTestId("levelBtn"));
    expect(screen.getByTestId("levelBtn")).toHaveTextContent("LEVEL: MEDIUM");

    fireEvent.press(screen.getByTestId("levelBtn"));
    expect(screen.getByTestId("levelBtn")).toHaveTextContent("LEVEL: HARD");

    fireEvent.press(screen.getByTestId("levelBtn"));
    expect(screen.getByTestId("levelBtn")).toHaveTextContent("LEVEL: EASY");
  });

  test("is remembered the next time the title opens", () => {
    let first = render(<TitleScreen />);
    fireEvent.press(screen.getByTestId("levelBtn"));
    fireEvent.press(screen.getByTestId("levelBtn"));
    first.unmount();

    render(<TitleScreen />);

    expect(screen.getByTestId("levelBtn")).toHaveTextContent("LEVEL: HARD");
  });

  test("is read aloud with its current value", () => {
    render(<TitleScreen />);

    expect(screen.getByRole("button", { name: "Level, easy" })).toBeOnTheScreen();
  });
});

describe("season", () => {
  test("starts early and cycles rut, late, then back to early", () => {
    render(<TitleScreen />);

    expect(screen.getByTestId("seasonBtn")).toHaveTextContent("SEASON: EARLY");

    fireEvent.press(screen.getByTestId("seasonBtn"));
    expect(screen.getByTestId("seasonBtn")).toHaveTextContent("SEASON: RUT");

    fireEvent.press(screen.getByTestId("seasonBtn"));
    expect(screen.getByTestId("seasonBtn")).toHaveTextContent("SEASON: LATE");

    fireEvent.press(screen.getByTestId("seasonBtn"));
    expect(screen.getByTestId("seasonBtn")).toHaveTextContent("SEASON: EARLY");
  });

  test("is remembered the next time the title opens", () => {
    let first = render(<TitleScreen />);
    fireEvent.press(screen.getByTestId("seasonBtn"));
    first.unmount();

    render(<TitleScreen />);

    expect(screen.getByTestId("seasonBtn")).toHaveTextContent("SEASON: RUT");
  });
});

describe("hunting license", () => {
  test("is a license with a heading printed at 12 points", () => {
    render(<TitleScreen />);

    expect(screen.getByTestId("huntingLicense")).toBeOnTheScreen();
    expect(screen.getByText("HUNTING LICENSE")).toHaveStyle({ fontSize: 12 });
  });

  test("carries the level and the season as stamps, and GO HUNTING as a tag, all inside it", () => {
    render(<TitleScreen />);
    let license = screen.getByTestId("huntingLicense");

    expect(license).toContainElement(screen.getByTestId("levelBtn"));
    expect(license).toContainElement(screen.getByTestId("seasonBtn"));
    expect(license).toContainElement(screen.getByTestId("goHuntingBtn"));
    expect(screen.getByTestId("levelBtn")).toHaveTextContent("LEVEL: EASY");
    expect(screen.getByTestId("seasonBtn")).toHaveTextContent("SEASON: EARLY");
  });

  test("prints the tag's words at 12 points or bigger", () => {
    render(<TitleScreen />);

    expect(screen.getByText("GO HUNTING")).toHaveStyle({ fontSize: 14 });
  });

  test("hangs the journal as a smaller tag under the license, not on it", () => {
    render(<TitleScreen />);

    expect(screen.getByTestId("huntingLicense")).not.toContainElement(
      screen.getByTestId("journalBtn")
    );
    expect(screen.getByTestId("journalBtn")).toHaveTextContent("JOURNAL");
    expect(screen.getByText("JOURNAL")).toHaveStyle({ fontSize: 12 });
  });

  test("has no footer line", () => {
    render(<TitleScreen />);

    expect(screen.queryByTestId("lastHuntLabel")).not.toBeOnTheScreen();
    expect(screen.queryByText(/CEDAR HOLLOW/)).not.toBeOnTheScreen();
  });
});
