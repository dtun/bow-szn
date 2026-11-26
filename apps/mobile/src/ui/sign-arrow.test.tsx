import { fireEvent, render, screen } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";

import { playSfx } from "@/platform/sfx";

import { SignArrow } from "./sign-arrow";

jest.mock("@/platform/sfx");

test("shows its label, and a press calls onPress once", () => {
  let onPress = jest.fn();
  render(<SignArrow label="HUNT!" direction="right" onPress={onPress} testID="huntBtn" />);

  expect(screen.getByText("HUNT!")).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId("huntBtn"));

  expect(onPress).toHaveBeenCalledTimes(1);
});

test("is announced as a button with its label", () => {
  render(<SignArrow label="BACK" direction="left" onPress={jest.fn()} testID="mapBackBtn" />);

  expect(screen.getByRole("button", { name: "BACK" })).toBeOnTheScreen();
});

test("a spoken label and hint replace the printed label for a screen reader", () => {
  render(
    <SignArrow
      label="SKIP"
      accessibilityLabel="Skip sighting in"
      accessibilityHint="Starts the hunt"
      direction="right"
      onPress={jest.fn()}
      testID="skipPrepBtn"
    />
  );

  expect(screen.getByRole("button", { name: "Skip sighting in" })).toBeOnTheScreen();
  expect(screen.getByHintText("Starts the hunt")).toBeOnTheScreen();
});

test("a press ticks the phone and clicks once, and nothing does before it", () => {
  render(<SignArrow label="BACK" direction="left" onPress={jest.fn()} testID="mapBackBtn" />);
  expect(Haptics.impactAsync).not.toHaveBeenCalled();
  expect(playSfx).not.toHaveBeenCalled();

  fireEvent.press(screen.getByTestId("mapBackBtn"));

  expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
  expect(Haptics.impactAsync).toHaveBeenCalledWith("light");
  expect(playSfx).toHaveBeenCalledTimes(1);
  expect(playSfx).toHaveBeenCalledWith("ui-select");
});

test("the point leads on the left for a left sign and on the right for a right sign", () => {
  render(
    <>
      <SignArrow label="BACK" direction="left" onPress={jest.fn()} testID="leftSign" />
      <SignArrow label="HUNT!" direction="right" onPress={jest.fn()} testID="rightSign" />
    </>
  );

  expect(screen.getByTestId("leftSign")).toHaveStyle({ flexDirection: "row" });
  expect(screen.getByTestId("rightSign")).toHaveStyle({ flexDirection: "row-reverse" });
});

test("every label prints at 12 points or bigger, and the primary one bigger still", () => {
  render(
    <>
      <SignArrow label="BACK" direction="left" onPress={jest.fn()} testID="plainSign" />
      <SignArrow
        label="HUNT!"
        direction="right"
        emphasis="primary"
        onPress={jest.fn()}
        testID="primarySign"
      />
    </>
  );

  expect(screen.getByText("BACK")).toHaveStyle({ fontSize: 12 });
  expect(screen.getByText("HUNT!")).toHaveStyle({ fontSize: 14 });
});
