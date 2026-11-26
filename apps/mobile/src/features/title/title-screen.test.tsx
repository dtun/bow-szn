import { render, screen } from "@testing-library/react-native";

import { TitleScreen } from "./title-screen";

test("shows the game title on the title screen", () => {
  render(<TitleScreen />);

  expect(screen.getByTestId("titleScreen")).toBeOnTheScreen();
  expect(screen.getByTestId("titleScreen")).toHaveTextContent("BOW SEASON");
  expect(screen.getByText("BOW SEASON")).toBeVisible();
});
