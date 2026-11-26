import { fireEvent, render, screen } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";

import { playSfx } from "@/platform/sfx";

import { StampButton } from "./stamp-button";

jest.mock("@/platform/sfx");

test("prints its label and value on two lines, read as one line of text", () => {
  render(<StampButton label="SEASON:" value="EARLY" onPress={jest.fn()} testID="mapSeasonBtn" />);

  expect(screen.getByTestId("mapSeasonBtn")).toHaveTextContent("SEASON: EARLY");
});

test("a press calls onPress once, ticks the phone, and clicks", () => {
  let onPress = jest.fn();
  render(<StampButton label="SEASON:" value="EARLY" onPress={onPress} testID="mapSeasonBtn" />);
  expect(Haptics.impactAsync).not.toHaveBeenCalled();

  fireEvent.press(screen.getByTestId("mapSeasonBtn"));

  expect(onPress).toHaveBeenCalledTimes(1);
  expect(Haptics.impactAsync).toHaveBeenCalledWith("light");
  expect(playSfx).toHaveBeenCalledWith("ui-select");
});

test("is announced as a button named by its label and value, unless told otherwise", () => {
  render(<StampButton label="SEASON:" value="RUT" onPress={jest.fn()} testID="mapSeasonBtn" />);

  expect(screen.getByRole("button", { name: "SEASON: RUT" })).toBeOnTheScreen();
});

test("a spoken label and hint replace the printed ones", () => {
  render(
    <StampButton
      label="SEASON:"
      value="RUT"
      accessibilityLabel="Season, rut"
      accessibilityHint="Switches to the next season"
      onPress={jest.fn()}
      testID="mapSeasonBtn"
    />
  );

  expect(screen.getByRole("button", { name: "Season, rut" })).toBeOnTheScreen();
  expect(screen.getByHintText("Switches to the next season")).toBeOnTheScreen();
});

test("the label and the value both print at 12 points or bigger", () => {
  render(<StampButton label="SEASON:" value="LATE" onPress={jest.fn()} testID="mapSeasonBtn" />);

  expect(screen.getByText(/SEASON:/)).toHaveStyle({ fontSize: 12 });
  expect(screen.getByText("LATE")).toHaveStyle({ fontSize: 16 });
});

test("the value on the stamp follows the caller when it changes", () => {
  let { rerender } = render(
    <StampButton label="SEASON:" value="EARLY" onPress={jest.fn()} testID="mapSeasonBtn" />
  );

  rerender(<StampButton label="SEASON:" value="RUT" onPress={jest.fn()} testID="mapSeasonBtn" />);

  expect(screen.getByTestId("mapSeasonBtn")).toHaveTextContent("SEASON: RUT");
});
