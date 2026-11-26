import { act, fireEvent, screen } from "@testing-library/react-native";

import { dragBackAndLetGo } from "./pan";
import { PULL_TO_EMPTY_GROUND } from "./standing-doe";

const LANDED_MS = 1500;

export function shootIntoTheDirt(arrows: number) {
  for (let shot = 0; shot < arrows; shot++) {
    dragBackAndLetGo(PULL_TO_EMPTY_GROUND);
    act(() => {
      jest.advanceTimersByTime(LANDED_MS);
    });
    fireEvent.press(screen.getByTestId("shotResult"));
  }
}
