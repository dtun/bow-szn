import type { HuntConfig } from "@bow-szn/core";
import { act, renderHook } from "@testing-library/react-native";

import { useHunt } from "./use-hunt";

const CONFIG: HuntConfig = { spot: "cedar-hollow", season: "early", difficulty: "easy", seed: 42 };

type FrameCallback = (nowMs: number) => void;

let scheduled = new Map<number, FrameCallback>();
let nextFrameId = 1;

function runNextFrame(nowMs: number) {
  let [id, callback] = [...scheduled.entries()][0];
  scheduled.delete(id);
  act(() => callback(nowMs));
}

beforeEach(() => {
  scheduled = new Map();
  nextFrameId = 1;
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

test("starts ready, before any frame has run", () => {
  let { result } = renderHook(() => useHunt(CONFIG));

  expect(result.current.state.config).toEqual(CONFIG);
  expect(result.current.state.phase).toEqual({ kind: "ready" });
  expect(result.current.state.elapsedMs).toBe(0);
});

test("the first frame only sets the time baseline", () => {
  let { result } = renderHook(() => useHunt(CONFIG));

  runNextFrame(5000);

  expect(result.current.state.elapsedMs).toBe(0);
});

test("advances the hunt by the time between frames", () => {
  let { result } = renderHook(() => useHunt(CONFIG));

  runNextFrame(1000);
  runNextFrame(1016);
  runNextFrame(1033);

  expect(result.current.state.elapsedMs).toBe(33);
});

test("a long gap between frames moves the hunt forward by only 50 ms", () => {
  let { result } = renderHook(() => useHunt(CONFIG));

  runNextFrame(1000);
  runNextFrame(9000);

  expect(result.current.state.elapsedMs).toBe(50);
});

test("passes events through to the hunt", () => {
  let { result } = renderHook(() => useHunt(CONFIG));

  act(() => result.current.dispatch({ type: "draw-start" }));
  act(() => result.current.dispatch({ type: "draw-move", pull: { x: 0, y: 30 } }));

  expect(result.current.state.phase).toEqual({
    kind: "drawing",
    pull: { x: 0, y: 30 },
    heldMs: 0,
  });
});

test("stops asking for frames once the screen is gone", () => {
  let { unmount } = renderHook(() => useHunt(CONFIG));
  runNextFrame(1000);

  unmount();

  expect(scheduled.size).toBe(0);
});

test("hands the effects of each step to the sink once", () => {
  let sink = jest.fn();
  let { result } = renderHook(() => useHunt(CONFIG, sink));

  act(() => result.current.dispatch({ type: "draw-start" }));
  act(() => result.current.dispatch({ type: "cancel" }));

  expect(sink.mock.calls).toEqual([[[{ kind: "sound", sound: "creak" }]]]);
});
