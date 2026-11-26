import { fireEvent, render, screen } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";

import { playSfx } from "@/platform/sfx";

import { PixelButton } from "./pixel-button";

jest.mock("@/platform/sfx");

test("a press ticks the phone and clicks once", () => {
  render(<PixelButton label="LEVEL: EASY" onPress={jest.fn()} testID="levelBtn" />);

  fireEvent.press(screen.getByTestId("levelBtn"));

  expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
  expect(Haptics.impactAsync).toHaveBeenCalledWith("light");
  expect(playSfx).toHaveBeenCalledTimes(1);
  expect(playSfx).toHaveBeenCalledWith("ui-select");
});

test("nothing ticks or clicks until the button is pressed", () => {
  render(<PixelButton label="LEVEL: EASY" onPress={jest.fn()} testID="levelBtn" />);

  expect(Haptics.impactAsync).not.toHaveBeenCalled();
  expect(playSfx).not.toHaveBeenCalled();
});

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

test("announces a spoken label and hint in place of the printed label", () => {
  render(
    <PixelButton
      label="LEVEL: EASY"
      accessibilityLabel="Level, easy"
      accessibilityHint="Switches to the next level"
      onPress={jest.fn()}
      testID="levelBtn"
    />
  );

  expect(screen.getByRole("button", { name: "Level, easy" })).toBeOnTheScreen();
  expect(screen.getByHintText("Switches to the next level")).toBeOnTheScreen();
});

test("the tone picks the button color: red, brown, or navy", () => {
  render(
    <>
      <PixelButton label="RED" onPress={jest.fn()} testID="redBtn" />
      <PixelButton label="BROWN" tone="brown" onPress={jest.fn()} testID="brownBtn" />
      <PixelButton label="NAVY" tone="navy" onPress={jest.fn()} testID="navyBtn" />
    </>
  );

  expect(screen.getByTestId("redBtn")).toHaveStyle({ backgroundColor: "#e23b3b" });
  expect(screen.getByTestId("brownBtn")).toHaveStyle({ backgroundColor: "#8b5a2f" });
  expect(screen.getByTestId("navyBtn")).toHaveStyle({ backgroundColor: "#13214a" });
});

test("a layout style from the caller reaches the button", () => {
  render(<PixelButton label="BACK" onPress={jest.fn()} testID="backBtn" style={{ flex: 1 }} />);

  expect(screen.getByTestId("backBtn")).toHaveStyle({ flex: 1 });
});

test("a small button prints a smaller label than a normal one", () => {
  render(
    <>
      <PixelButton label="NORMAL" onPress={jest.fn()} testID="normalBtn" />
      <PixelButton label="SMALL" size="small" onPress={jest.fn()} testID="smallBtn" />
    </>
  );

  expect(screen.getByText("NORMAL")).toHaveStyle({ fontSize: 14 });
  expect(screen.getByText("SMALL")).toHaveStyle({ fontSize: 10 });
});
