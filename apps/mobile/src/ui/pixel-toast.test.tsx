import { render, screen } from "@testing-library/react-native";

import { PixelToast } from "./pixel-toast";

test("reads its message in 12 point type", () => {
  render(<PixelToast testID="hintToast" message="TRY AGAIN" onDone={jest.fn()} />);

  expect(screen.getByTestId("hintToast")).toHaveTextContent("TRY AGAIN");
  expect(screen.getByText("TRY AGAIN")).toHaveStyle({ fontSize: 12 });
});
