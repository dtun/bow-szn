import { act, renderHook } from "@testing-library/react-native";

import { useAmbientClock } from "./use-ambient-clock";

const STEP_MS = 1000 / 12;
const SIXTY_HZ_MS = 1000 / 60;
const SLOW_FRAME_MS = 90;

let scheduled: Map<number, FrameRequestCallback>;
let nextFrameId: number;

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

function frameAt(nowMs: number) {
  act(() => {
    let due = [...scheduled.values()];
    scheduled.clear();
    for (let callback of due) {
      callback(nowMs);
    }
  });
}

function runFrames(fromMs: number, frames: number, intervalMs: number) {
  for (let index = 0; index < frames; index++) {
    frameAt(fromMs + index * intervalMs);
  }
}

test("starts at zero and asks for a frame while running", () => {
  let { result } = renderHook(() => useAmbientClock(true));

  expect(result.current).toBe(0);
  expect(scheduled.size).toBe(1);
});

test("steps in twelfths of a second, not smoothly", () => {
  let { result } = renderHook(() => useAmbientClock(true));
  let times: number[] = [];

  for (let index = 0; index < 60; index++) {
    frameAt(1000 + index * SIXTY_HZ_MS);
    times.push(result.current);
  }

  let distinct = [...new Set(times)];
  expect(distinct).toHaveLength(12);
  distinct.forEach((time, step) => expect(time).toBeCloseTo(step * STEP_MS, 6));
});

test("a stalled frame counts for at most a tenth of a second", () => {
  let { result } = renderHook(() => useAmbientClock(true));

  frameAt(0);
  frameAt(5000);

  expect(result.current).toBeCloseTo(STEP_MS, 6);
});

test("does not ask for frames while paused", () => {
  renderHook(() => useAmbientClock(false));

  expect(scheduled.size).toBe(0);
});

test("stops asking for frames when paused, and holds the time it reached", () => {
  let { result, rerender } = renderHook(
    ({ running }: { running: boolean }) => useAmbientClock(running),
    {
      initialProps: { running: true },
    }
  );
  runFrames(1000, 6, SLOW_FRAME_MS);

  rerender({ running: false });

  expect(scheduled.size).toBe(0);
  expect(result.current).toBeCloseTo(5 * STEP_MS, 6);
});

test("picks up where it left off, without jumping the time it was paused for", () => {
  let { result, rerender } = renderHook(
    ({ running }: { running: boolean }) => useAmbientClock(running),
    {
      initialProps: { running: true },
    }
  );
  runFrames(1000, 6, SLOW_FRAME_MS);
  rerender({ running: false });

  rerender({ running: true });
  runFrames(900000, 3, SLOW_FRAME_MS);

  expect(result.current).toBeCloseTo(7 * STEP_MS, 6);
});

test("lets go of its frame when the screen goes away", () => {
  let { unmount } = renderHook(() => useAmbientClock(true));

  unmount();

  expect(scheduled.size).toBe(0);
});
