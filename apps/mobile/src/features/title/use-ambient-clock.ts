import { useEffect, useRef, useState } from "react";

const AMBIENT_FPS = 12;

const FRAME_MS = 1000 / AMBIENT_FPS;
const MAX_STEP_MS = 100;

export function useAmbientClock(running: boolean): number {
  let [frame, setFrame] = useState(0);
  let elapsedMs = useRef(0);

  useEffect(() => {
    if (!running) {
      return;
    }
    let previousMs: number | null = null;
    let handle = 0;

    function onFrame(nowMs: number) {
      if (previousMs !== null) {
        elapsedMs.current += Math.min(nowMs - previousMs, MAX_STEP_MS);
        setFrame(Math.floor(elapsedMs.current / FRAME_MS));
      }
      previousMs = nowMs;
      handle = requestAnimationFrame(onFrame);
    }

    handle = requestAnimationFrame(onFrame);
    return () => cancelAnimationFrame(handle);
  }, [running]);

  return frame * FRAME_MS;
}
