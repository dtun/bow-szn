import { act, renderHook } from "@testing-library/react-native";

import { updatePreferences, usePreferences } from "./preferences";

test("every screen using the hook sees an update the moment it is saved", () => {
  let first = renderHook(() => usePreferences());
  let second = renderHook(() => usePreferences());

  act(() => updatePreferences({ season: "late" }));

  expect(first.result.current.season).toBe("late");
  expect(second.result.current.season).toBe("late");
});

test("a screen that mounts later starts from what was saved", () => {
  updatePreferences({ difficulty: "hard", spot: "high-ridge" });

  let { result } = renderHook(() => usePreferences());

  expect(result.current).toEqual({ difficulty: "hard", season: "early", spot: "high-ridge" });
});
