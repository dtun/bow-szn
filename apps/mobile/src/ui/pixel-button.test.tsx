import { fireEvent, render, screen } from "@testing-library/react-native";

import { PixelButton } from "./pixel-button";

test("shows its label and calls onPress once when pressed", () => {
  let onPress = jest.fn();
  render(<PixelButton label="GO HUNTING" onPress={onPress} testID="goHuntingBtn" />);

  expect(screen.getByText("GO HUNTING")).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId("goHuntingBtn"));

  expect(onPress).toHaveBeenCalledTimes(1);
});

test("is announced as a button", () => {
  render(<PixelButton label="GO HUNTING" onPress={jest.fn()} testID="goHuntingBtn" />);

  expect(screen.getByRole("button", { name: "GO HUNTING" })).toBeOnTheScreen();
});
