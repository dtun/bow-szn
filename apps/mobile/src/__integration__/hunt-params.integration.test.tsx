import path from "path";

import { router } from "expo-router";
import { act, renderRouter, screen } from "expo-router/testing-library";

const APP_DIR = path.resolve(__dirname, "../../app");

test("opening the hunt again by link with new params starts a fresh hunt at the new spot", async () => {
  renderRouter(APP_DIR);

  expect(await screen.findByTestId("titleScreen")).toBeOnTheScreen();
  act(() => {
    router.push("/hunt?seed=1");
  });
  expect(await screen.findByText("CEDAR HOLLOW")).toBeOnTheScreen();

  act(() => {
    router.navigate("/hunt?seed=2&spot=high-ridge");
  });

  expect(await screen.findByText("HIGH RIDGE")).toBeOnTheScreen();
  expect(screen.queryByText("CEDAR HOLLOW")).not.toBeOnTheScreen();
});
