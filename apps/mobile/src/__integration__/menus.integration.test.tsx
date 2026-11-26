import path from "path";

import { fireEvent, renderRouter, screen } from "expo-router/testing-library";

const APP_DIR = path.resolve(__dirname, "../../app");

jest.setTimeout(20_000);

async function openMapFromTitle() {
  expect(await screen.findByTestId("titleScreen")).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId("goHuntingBtn"));
  expect(await screen.findByTestId("mapScreen")).toBeOnTheScreen();
}

async function openPrepFromMap() {
  fireEvent.press(screen.getByTestId("huntBtn"));
  expect(await screen.findByTestId("prepScreen")).toBeOnTheScreen();
}

test("title to map to prep to hunt: the chosen level, season, and spot reach the hunt", async () => {
  let app = renderRouter(APP_DIR);
  expect(await screen.findByTestId("titleScreen")).toBeOnTheScreen();
  expect(app.getPathname()).toBe("/");

  fireEvent.press(screen.getByTestId("levelBtn"));
  fireEvent.press(screen.getByTestId("seasonBtn"));
  expect(screen.getByTestId("levelBtn")).toHaveTextContent("LEVEL: MEDIUM");
  expect(screen.getByTestId("seasonBtn")).toHaveTextContent("SEASON: RUT");

  fireEvent.press(screen.getByTestId("goHuntingBtn"));
  expect(await screen.findByTestId("mapScreen")).toBeOnTheScreen();
  expect(app.getPathname()).toBe("/map");
  expect(screen.getByTestId("mapSeasonBtn")).toHaveTextContent("SEASON: RUT");

  fireEvent.press(screen.getByTestId("spotFlag-high-ridge"));
  expect(screen.getByTestId("spotName")).toHaveTextContent("HIGH RIDGE");
  expect(screen.getByTestId("spotSpecies")).toHaveTextContent("SPECIES: ELK, WHITETAIL");

  fireEvent.press(screen.getByTestId("huntBtn"));
  expect(await screen.findByTestId("prepScreen")).toBeOnTheScreen();
  expect(app.getPathname()).toBe("/prep");

  fireEvent.press(screen.getByTestId("skipPrepBtn"));
  expect(await screen.findByTestId("huntScreen")).toBeOnTheScreen();
  expect(app.getPathname()).toBe("/hunt");
  expect(app.getSearchParams()).toEqual({
    spot: "high-ridge",
    season: "rut",
    difficulty: "medium",
  });
});

test("a player who changes nothing hunts the first spot on easy in the early season", async () => {
  let app = renderRouter(APP_DIR);
  await openMapFromTitle();
  await openPrepFromMap();

  fireEvent.press(screen.getByTestId("skipPrepBtn"));

  expect(await screen.findByTestId("huntScreen")).toBeOnTheScreen();
  expect(app.getSearchParams()).toEqual({
    spot: "cedar-hollow",
    season: "early",
    difficulty: "easy",
  });
});

test("BACK on the map returns to the title", async () => {
  let app = renderRouter(APP_DIR);
  await openMapFromTitle();
  expect(app.getPathname()).toBe("/map");

  fireEvent.press(screen.getByTestId("mapBackBtn"));

  expect(await screen.findByTestId("titleScreen")).toBeOnTheScreen();
  expect(app.getPathname()).toBe("/");
  expect(screen.queryByTestId("mapScreen")).not.toBeOnTheScreen();
});

test("BACK on the prep bench returns to the map with the spot still chosen", async () => {
  let app = renderRouter(APP_DIR);
  await openMapFromTitle();
  fireEvent.press(screen.getByTestId("spotFlag-cattail-marsh"));
  await openPrepFromMap();
  expect(app.getPathname()).toBe("/prep");

  fireEvent.press(screen.getByTestId("prepBackBtn"));

  expect(await screen.findByTestId("mapScreen")).toBeOnTheScreen();
  expect(app.getPathname()).toBe("/map");
  expect(screen.queryByTestId("prepScreen")).not.toBeOnTheScreen();
  expect(screen.getByTestId("spotName")).toHaveTextContent("CATTAIL MARSH");
});

test("BACK twice from the bench leads all the way to the title", async () => {
  let app = renderRouter(APP_DIR);
  await openMapFromTitle();
  await openPrepFromMap();

  fireEvent.press(screen.getByTestId("prepBackBtn"));
  expect(await screen.findByTestId("mapScreen")).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId("mapBackBtn"));

  expect(await screen.findByTestId("titleScreen")).toBeOnTheScreen();
  expect(app.getPathname()).toBe("/");
});

test("a map opened straight from a link still has a way out", async () => {
  let app = renderRouter(APP_DIR, { initialUrl: "/map" });
  expect(await screen.findByTestId("mapScreen")).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId("mapBackBtn"));

  expect(await screen.findByTestId("titleScreen")).toBeOnTheScreen();
  expect(app.getPathname()).toBe("/");
});

test("a prep bench opened straight from a link still has a way out", async () => {
  let app = renderRouter(APP_DIR, { initialUrl: "/prep" });
  expect(await screen.findByTestId("prepScreen")).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId("prepBackBtn"));

  expect(await screen.findByTestId("mapScreen")).toBeOnTheScreen();
  expect(app.getPathname()).toBe("/map");
});
