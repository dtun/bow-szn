import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

export type ReduceMotionSource = {
  read(): Promise<boolean>;
  subscribe(listener: (enabled: boolean) => void): () => void;
};

export const deviceReduceMotion: ReduceMotionSource = {
  read() {
    return AccessibilityInfo.isReduceMotionEnabled();
  },
  subscribe(listener) {
    let subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", listener);
    return () => subscription.remove();
  },
};

export type FakeReduceMotion = ReduceMotionSource & {
  set(enabled: boolean): void;
  listenerCount(): number;
};

export function createFakeReduceMotion(enabled: boolean = false): FakeReduceMotion {
  let current = enabled;
  let listeners = new Set<(enabled: boolean) => void>();
  return {
    async read() {
      return current;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    set(next) {
      current = next;
      for (let listener of listeners) {
        listener(next);
      }
    },
    listenerCount() {
      return listeners.size;
    },
  };
}

async function readQuietly(source: ReduceMotionSource): Promise<boolean> {
  try {
    return await source.read();
  } catch {
    return true;
  }
}

export function useReduceMotion(source: ReduceMotionSource = deviceReduceMotion): boolean {
  let [reduced, setReduced] = useState(true);

  useEffect(() => {
    let mounted = true;
    let unsubscribe = source.subscribe(setReduced);
    void readQuietly(source).then((enabled) => {
      if (mounted) {
        setReduced(enabled);
      }
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [source]);

  return reduced;
}
