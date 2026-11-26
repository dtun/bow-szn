import {
  createPrep,
  isPrepDone,
  prepReducer,
  type Difficulty,
  type PrepEvent,
  type PrepState,
} from "@bow-szn/core";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Landing } from "./landings";

const MAX_FRAME_MS = 50;

export function usePrep(
  difficulty: Difficulty,
  seed: number
): { state: PrepState; landings: Landing[]; tap: () => PrepState } {
  let [state, setState] = useState(() => createPrep(difficulty, seed));
  let [landings, setLandings] = useState<Landing[]>([]);
  let latest = useRef(state);

  let apply = useCallback((event: PrepEvent): PrepState => {
    let next = prepReducer(latest.current, event);
    latest.current = next;
    setState(next);
    return next;
  }, []);

  useEffect(() => {
    let previousMs: number | null = null;
    let frame = 0;

    function onFrame(nowMs: number) {
      if (previousMs !== null) {
        apply({
          type: "tick",
          dtMs: Math.min(nowMs - previousMs, MAX_FRAME_MS),
        });
      }
      previousMs = nowMs;
      if (!isPrepDone(latest.current)) {
        frame = requestAnimationFrame(onFrame);
      }
    }

    frame = requestAnimationFrame(onFrame);
    return () => cancelAnimationFrame(frame);
  }, [apply]);

  let tap = useCallback(() => {
    let before = latest.current;
    let next = apply({ type: "tap" });
    if (!isPrepDone(before)) {
      setLandings((landed) => [
        ...landed,
        { pos: before.markerPos, zone: before.zone, hit: next.lastTap === "hit" },
      ]);
    }
    return next;
  }, [apply]);

  return { state, landings, tap };
}
