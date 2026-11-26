import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";

import { readPreferences, updatePreferences } from "@/platform/preferences";

import { MapScreen } from "./map-screen";

afterEach(() => {
  jest.restoreAllMocks();
});

test("is headed PINE KNOB COUNTY and names the county's towns", () => {
  render(<MapScreen />);

  expect(screen.getByTestId("mapScreen")).toBeOnTheScreen();
  expect(screen.getByRole("header", { name: "PINE KNOB COUNTY" })).toBeOnTheScreen();
  for (let town of ["ELDER", "MASON FORK", "BRYCE", "OAKLEY"]) {
    expect(screen.getByText(town)).toBeOnTheScreen();
  }
});

test.each(["cedar-hollow", "miller-bottoms", "cattail-marsh", "high-ridge"])(
  "plants a flag at %s",
  (spot) => {
    render(<MapScreen />);

    expect(screen.getByTestId(`spotFlag-${spot}`)).toBeOnTheScreen();
  }
);

describe("choosing a spot", () => {
  test("starts on the spot of the last hunt and shows what is there", () => {
    updatePreferences({ spot: "miller-bottoms" });

    render(<MapScreen />);

    expect(screen.getByTestId("spotName")).toHaveTextContent("MILLER BOTTOMS");
    expect(screen.getByTestId("spotBlurb")).toHaveTextContent(
      "OPEN HAYFIELD BY THE CREEK. SHORT SHOTS AND PLENTY OF RABBITS."
    );
    expect(screen.getByTestId("spotSpecies")).toHaveTextContent(
      "SPECIES: WHITETAIL, RABBIT, TURKEY"
    );
    expect(screen.getByTestId("spotDifficulty")).toHaveTextContent("DIFFICULTY: EASY");
  });

  test("tapping a flag fills the panel with that spot", () => {
    render(<MapScreen />);

    fireEvent.press(screen.getByTestId("spotFlag-high-ridge"));

    expect(screen.getByTestId("spotName")).toHaveTextContent("HIGH RIDGE");
    expect(screen.getByTestId("spotBlurb")).toHaveTextContent(
      "THIN AIR AND LONG LOOKS. BULLS BUGLE UP HERE IN THE RUT."
    );
    expect(screen.getByTestId("spotDifficulty")).toHaveTextContent("DIFFICULTY: HARD");
  });

  test("the panel lists only the animals that roam that spot in the season", () => {
    updatePreferences({ season: "rut" });
    render(<MapScreen />);

    fireEvent.press(screen.getByTestId("spotFlag-high-ridge"));

    expect(screen.getByTestId("spotSpecies")).toHaveTextContent("SPECIES: ELK, WHITETAIL");
  });

  test("elk are not out at High Ridge in the early season", () => {
    render(<MapScreen />);

    fireEvent.press(screen.getByTestId("spotFlag-high-ridge"));

    expect(screen.getByTestId("spotSpecies")).toHaveTextContent("SPECIES: WHITETAIL");
  });

  test("only the chosen flag reads as selected", () => {
    render(<MapScreen />);

    fireEvent.press(screen.getByTestId("spotFlag-cattail-marsh"));

    expect(screen.getByTestId("spotFlag-cattail-marsh")).toBeSelected();
    expect(screen.getByTestId("spotFlag-cedar-hollow")).not.toBeSelected();
  });

  test("a flag is read aloud with its spot name and difficulty", () => {
    render(<MapScreen />);

    expect(screen.getByRole("button", { name: "HIGH RIDGE, hard" })).toBeOnTheScreen();
  });

  test("the choice is remembered as the last spot", () => {
    render(<MapScreen />);

    fireEvent.press(screen.getByTestId("spotFlag-cattail-marsh"));

    expect(readPreferences().spot).toBe("cattail-marsh");
  });
});

describe("BACK", () => {
  test("goes back to the screen before when there is one", () => {
    jest.spyOn(router, "canGoBack").mockReturnValue(true);
    let back = jest.spyOn(router, "back").mockImplementation(() => undefined);
    render(<MapScreen />);

    fireEvent.press(screen.getByTestId("mapBackBtn"));

    expect(back).toHaveBeenCalledTimes(1);
  });

  test("goes to the title when the map was opened directly", () => {
    jest.spyOn(router, "canGoBack").mockReturnValue(false);
    let replace = jest.spyOn(router, "replace").mockImplementation(() => undefined);
    render(<MapScreen />);

    fireEvent.press(screen.getByTestId("mapBackBtn"));

    expect(replace).toHaveBeenCalledWith("/");
  });
});

describe("season", () => {
  test("cycles early, rut, late, then back to early", () => {
    render(<MapScreen />);

    expect(screen.getByTestId("mapSeasonBtn")).toHaveTextContent("SEASON: EARLY");

    fireEvent.press(screen.getByTestId("mapSeasonBtn"));
    expect(screen.getByTestId("mapSeasonBtn")).toHaveTextContent("SEASON: RUT");

    fireEvent.press(screen.getByTestId("mapSeasonBtn"));
    expect(screen.getByTestId("mapSeasonBtn")).toHaveTextContent("SEASON: LATE");

    fireEvent.press(screen.getByTestId("mapSeasonBtn"));
    expect(screen.getByTestId("mapSeasonBtn")).toHaveTextContent("SEASON: EARLY");
  });

  test("is saved, and brings the elk to High Ridge when the rut starts", () => {
    updatePreferences({ spot: "high-ridge" });
    render(<MapScreen />);

    fireEvent.press(screen.getByTestId("mapSeasonBtn"));

    expect(readPreferences().season).toBe("rut");
    expect(screen.getByTestId("spotSpecies")).toHaveTextContent("SPECIES: ELK, WHITETAIL");
  });

  test("is read aloud with its current value", () => {
    render(<MapScreen />);

    expect(screen.getByRole("button", { name: "Season, early" })).toBeOnTheScreen();
  });
});

describe("HUNT!", () => {
  test("heads to the prep bench", () => {
    let push = jest.spyOn(router, "push").mockImplementation(() => undefined);
    render(<MapScreen />);

    fireEvent.press(screen.getByTestId("huntBtn"));

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/prep");
  });

  test("is announced as a button", () => {
    render(<MapScreen />);

    expect(screen.getByRole("button", { name: "HUNT!" })).toBeOnTheScreen();
  });
});
