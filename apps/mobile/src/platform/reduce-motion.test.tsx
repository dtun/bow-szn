import { act, renderHook } from "@testing-library/react-native";
import { AccessibilityInfo } from "react-native";

import {
  createFakeReduceMotion,
  deviceReduceMotion,
  useReduceMotion,
  type ReduceMotionSource,
} from "./reduce-motion";

afterEach(() => {
  jest.restoreAllMocks();
});

async function settle() {
  await act(async () => {});
}

describe("the device", () => {
  test("reads the system's Reduce Motion setting", async () => {
    jest.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(true);

    expect(await deviceReduceMotion.read()).toBe(true);

    jest.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(false);

    expect(await deviceReduceMotion.read()).toBe(false);
  });

  test("hears when the setting changes, and stops listening when told to", () => {
    let remove = jest.fn();
    let handlers: Record<string, (enabled: boolean) => void> = {};
    jest.spyOn(AccessibilityInfo, "addEventListener").mockImplementation(((
      name: string,
      handler: (enabled: boolean) => void
    ) => {
      handlers[name] = handler;
      return { remove };
    }) as unknown as typeof AccessibilityInfo.addEventListener);
    let heard: boolean[] = [];

    let unsubscribe = deviceReduceMotion.subscribe((enabled) => heard.push(enabled));
    handlers.reduceMotionChanged(true);

    expect(heard).toEqual([true]);
    expect(remove).not.toHaveBeenCalled();

    unsubscribe();

    expect(remove).toHaveBeenCalledTimes(1);
  });
});

describe("useReduceMotion", () => {
  test("keeps the picture still until the device has answered", async () => {
    let { result } = renderHook(() => useReduceMotion(createFakeReduceMotion(false)));

    expect(result.current).toBe(true);

    await settle();

    expect(result.current).toBe(false);
  });

  test("stays still when the device asks for less motion", async () => {
    let { result } = renderHook(() => useReduceMotion(createFakeReduceMotion(true)));

    await settle();

    expect(result.current).toBe(true);
  });

  test("follows the setting while the screen is open", async () => {
    let fake = createFakeReduceMotion(false);
    let { result } = renderHook(() => useReduceMotion(fake));
    await settle();

    act(() => fake.set(true));

    expect(result.current).toBe(true);

    act(() => fake.set(false));

    expect(result.current).toBe(false);
  });

  test("stays still when the device cannot say", async () => {
    let silent: ReduceMotionSource = {
      read: () => Promise.reject(new Error("no accessibility service")),
      subscribe: () => () => undefined,
    };
    let { result } = renderHook(() => useReduceMotion(silent));

    await settle();

    expect(result.current).toBe(true);
  });

  test("stops listening when the screen goes away", async () => {
    let fake = createFakeReduceMotion(false);
    let { unmount } = renderHook(() => useReduceMotion(fake));
    await settle();

    expect(fake.listenerCount()).toBe(1);

    unmount();

    expect(fake.listenerCount()).toBe(0);
  });

  test("asks the device when no source is given", async () => {
    jest.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(false);
    let { result } = renderHook(() => useReduceMotion());

    await settle();

    expect(result.current).toBe(false);
  });
});
