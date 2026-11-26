import type { HuntConfig, HuntEvent, HuntState } from "@bow-szn/core";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import type { HuntEffect } from "./hunt-effects";
import { createSession, stepSession, type Juice } from "./hunt-session";

const MAX_FRAME_MS = 50;

export type EffectSink = (effects: HuntEffect[]) => void;

function ignoreEffects() {}

export function useHunt(
  config: HuntConfig,
  onEffects: EffectSink = ignoreEffects
): { state: HuntState; juice: Juice; dispatch: (event: HuntEvent) => void } {
  let [session, setSession] = useState(() => createSession(config));
  let latest = useRef(session);
  let sink = useRef(onEffects);

  useLayoutEffect(() => {
    sink.current = onEffects;
  });

  let dispatch = useCallback((event: HuntEvent) => {
    let stepped = stepSession(latest.current, event);
    latest.current = stepped.session;
    setSession(stepped.session);
    if (stepped.effects.length > 0) {
      sink.current(stepped.effects);
    }
  }, []);

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
  }, [dispatch]);

  return { state: session.hunt, juice: session.juice, dispatch };
}
