import path from "path";

import { renderRouter, screen } from "expo-router/testing-library";

test("opens on the title screen at the root route", async () => {
  let app = renderRouter(path.resolve(__dirname, "../../app"));

  expect(await screen.findByTestId("titleScreen")).toBeOnTheScreen();
  expect(app.getPathname()).toBe("/");
});
