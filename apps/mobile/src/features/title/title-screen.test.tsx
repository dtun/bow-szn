import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";

import { updatePreferences } from "@/platform/preferences";

import { TitleScreen } from "./title-screen";

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

test("wears the Pixel Hunting Club ribbon under the logo", () => {
  render(<TitleScreen />);

  expect(screen.getByText("PIXEL HUNTING CLUB")).toBeOnTheScreen();
});

test("offers a GO HUNTING button", () => {
  render(<TitleScreen />);

  expect(screen.getByTestId("goHuntingBtn")).toBeOnTheScreen();
  expect(screen.getByTestId("goHuntingBtn")).toHaveTextContent("GO HUNTING");
});

test("paints the dawn once the screen knows how big its sky is", () => {
  render(<TitleScreen />);

  expect(screen.queryByTestId("dawnScene")).not.toBeOnTheScreen();

  measure("titleScene", 390, 450);

  expect(screen.getByTestId("dawnScene")).toBeOnTheScreen();
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

describe("footer", () => {
  test("names the first spot and season on a fresh install", () => {
    render(<TitleScreen />);

    expect(screen.getByTestId("lastHuntLabel")).toHaveTextContent("CEDAR HOLLOW - EARLY");
  });

  test("names the spot and season of the last hunt", () => {
    updatePreferences({ spot: "high-ridge", season: "late" });

    render(<TitleScreen />);

    expect(screen.getByTestId("lastHuntLabel")).toHaveTextContent("HIGH RIDGE - LATE");
  });

  test("follows the season button", () => {
    render(<TitleScreen />);

    fireEvent.press(screen.getByTestId("seasonBtn"));

    expect(screen.getByTestId("lastHuntLabel")).toHaveTextContent("CEDAR HOLLOW - RUT");
  });
});
