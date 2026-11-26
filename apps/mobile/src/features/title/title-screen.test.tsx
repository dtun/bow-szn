import { fireEvent, render, screen } from "@testing-library/react-native";

import { TitleScreen } from "./title-screen";

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
