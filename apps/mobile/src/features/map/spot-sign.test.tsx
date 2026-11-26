import { SPOTS } from "@bow-szn/core";
import { render, screen } from "@testing-library/react-native";

import { SpotSign } from "./spot-sign";

test("posts the spot's name, blurb, in-season animals, and difficulty", () => {
  render(<SpotSign spot={SPOTS["cattail-marsh"]} season="late" />);

  expect(screen.getByTestId("spotPanel")).toBeOnTheScreen();
  expect(screen.getByTestId("spotName")).toHaveTextContent("CATTAIL MARSH");
  expect(screen.getByTestId("spotBlurb")).toHaveTextContent(
    "TALL REEDS AND SOFT GROUND. TURKEYS STRUT THE DRY EDGES."
  );
  expect(screen.getByTestId("spotSpecies")).toHaveTextContent("SPECIES: RABBIT, TURKEY, WHITETAIL");
  expect(screen.getByTestId("spotDifficulty")).toHaveTextContent("DIFFICULTY: MEDIUM");
});

test("lists only the animals that roam the spot in the season", () => {
  let { rerender } = render(<SpotSign spot={SPOTS["high-ridge"]} season="early" />);
  expect(screen.getByTestId("spotSpecies")).toHaveTextContent("SPECIES: WHITETAIL");

  rerender(<SpotSign spot={SPOTS["high-ridge"]} season="rut" />);

  expect(screen.getByTestId("spotSpecies")).toHaveTextContent("SPECIES: ELK, WHITETAIL");
});

test("every line prints at 12 points or bigger, and the name bigger still", () => {
  render(<SpotSign spot={SPOTS["miller-bottoms"]} season="early" />);

  expect(screen.getByTestId("spotName")).toHaveStyle({ fontSize: 14 });
  for (let id of ["spotBlurb", "spotSpecies", "spotDifficulty"]) {
    expect(screen.getByTestId(id)).toHaveStyle({ fontSize: 12 });
  }
});
