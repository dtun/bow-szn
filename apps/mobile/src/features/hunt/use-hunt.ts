import {
  createHunt,
  huntReducer,
  type HuntConfig,
  type HuntEvent,
  type HuntState,
} from "@bow-szn/core";
import { useEffect, useReducer, type Dispatch } from "react";

const MAX_FRAME_MS = 50;

export function useHunt(config: HuntConfig): { state: HuntState; dispatch: Dispatch<HuntEvent> } {
  let [state, dispatch] = useReducer(huntReducer, config, createHunt);

  useEffect(() => {
    let previousMs: number | null = null;
    let frame = 0;

    function onFrame(nowMs: number) {
      if (previousMs !== null) {
        dispatch({ type: "tick", dtMs: Math.min(nowMs - previousMs, MAX_FRAME_MS) });
      }
      previousMs = nowMs;
      frame = requestAnimationFrame(onFrame);
    }

    frame = requestAnimationFrame(onFrame);
    return () => cancelAnimationFrame(frame);
  }, []);

  return { state, dispatch };
}
