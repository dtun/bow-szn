import { act, render, screen } from "@testing-library/react-native";
import { useIsFocused } from "expo-router";

import { createFakeReduceMotion, type FakeReduceMotion } from "@/platform/reduce-motion";

import { DawnSceneView } from "./dawn-scene-view";

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  useIsFocused: jest.fn(() => true),
}));

let scheduled: Map<number, FrameRequestCallback>;
let nextFrameId: number;

beforeEach(() => {
  scheduled = new Map();
  nextFrameId = 1;
  jest.mocked(useIsFocused).mockReturnValue(true);
  jest.spyOn(globalThis, "requestAnimationFrame").mockImplementation((callback) => {
    let id = nextFrameId++;
    scheduled.set(id, callback);
    return id;
  });
  jest.spyOn(globalThis, "cancelAnimationFrame").mockImplementation((id) => {
    scheduled.delete(id);
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

async function settle() {
  await act(async () => {});
}

function renderDawn(reduceMotion: FakeReduceMotion) {
  return render(
    <DawnSceneView cols={98} rows={113} cell={4} seed={7} reduceMotion={reduceMotion} />
  );
}

test("paints the still dawn with the moving layer on top of it", async () => {
  renderDawn(createFakeReduceMotion(false));
  await settle();

  expect(screen.getByTestId("dawnScene")).toBeOnTheScreen();
  expect(screen.getByTestId("dawnAmbience")).toBeOnTheScreen();
});

test("keeps still until the device has said motion is fine", async () => {
  renderDawn(createFakeReduceMotion(false));

  expect(scheduled.size).toBe(0);

  await settle();

  expect(scheduled.size).toBe(1);
});

test("stays still for a player who asked for Reduce Motion", async () => {
  renderDawn(createFakeReduceMotion(true));

  await settle();

  expect(scheduled.size).toBe(0);
  expect(screen.getByTestId("dawnAmbience")).toBeOnTheScreen();
});

test("starts moving when Reduce Motion is switched off, and stops when it is switched on", async () => {
  let reduceMotion = createFakeReduceMotion(true);
  renderDawn(reduceMotion);
  await settle();

  act(() => reduceMotion.set(false));

  expect(scheduled.size).toBe(1);

  act(() => reduceMotion.set(true));

  expect(scheduled.size).toBe(0);
});

test("stops asking for frames while another screen covers the title, and resumes on return", async () => {
  let reduceMotion = createFakeReduceMotion(false);
  let view = renderDawn(reduceMotion);
  await settle();
  expect(scheduled.size).toBe(1);

  jest.mocked(useIsFocused).mockReturnValue(false);
  view.rerender(
    <DawnSceneView cols={98} rows={113} cell={4} seed={7} reduceMotion={reduceMotion} />
  );

  expect(scheduled.size).toBe(0);

  jest.mocked(useIsFocused).mockReturnValue(true);
  view.rerender(
    <DawnSceneView cols={98} rows={113} cell={4} seed={7} reduceMotion={reduceMotion} />
  );

  expect(scheduled.size).toBe(1);
});

test("does not start while the title is already covered", async () => {
  jest.mocked(useIsFocused).mockReturnValue(false);
  renderDawn(createFakeReduceMotion(false));

  await settle();

  expect(scheduled.size).toBe(0);
});

test("lets go of its frame when the title goes away", async () => {
  let view = renderDawn(createFakeReduceMotion(false));
  await settle();

  view.unmount();

  expect(scheduled.size).toBe(0);
});
