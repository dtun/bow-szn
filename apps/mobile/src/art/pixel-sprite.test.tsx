import { SPRITES } from "@bow-szn/pixels";
import { render, screen } from "@testing-library/react-native";

import { PixelSprite } from "./pixel-sprite";

test("takes up exactly its grid size times the scale, so every pixel is a whole block", () => {
  let wordmark = SPRITES["logo-wordmark"];
  render(<PixelSprite sprite={wordmark} scale={4} testID="wordmark" />);

  expect(screen.getByTestId("wordmark")).toHaveStyle({
    width: wordmark.w * 4,
    height: wordmark.h * 4,
  });
});

test("a taller sprite at the same scale takes up a taller canvas", () => {
  let bow = SPRITES["brand-bow"];
  render(<PixelSprite sprite={bow} scale={3} testID="bow" />);

  expect(screen.getByTestId("bow")).toHaveStyle({ width: bow.w * 3, height: bow.h * 3 });
});
