import { useIsFocused } from "expo-router";
import { useMemo } from "react";

import { SceneView } from "@/art/scene-view";
import {
  deviceReduceMotion,
  useReduceMotion,
  type ReduceMotionSource,
} from "@/platform/reduce-motion";

import { dawnScene, type DawnScene } from "./dawn-scene";
import { titleAmbience } from "./title-ambience";
import { useAmbientClock } from "./use-ambient-clock";

type DawnSceneViewProps = {
  cols: number;
  rows: number;
  cell: number;
  seed: number;
  skyTopRow?: number;
  horizonRow?: number;
  reduceMotion?: ReduceMotionSource;
};

type AmbientViewProps = {
  scene: DawnScene;
  cols: number;
  cell: number;
  seed: number;
  running: boolean;
};

function AmbientView({ scene, cols, cell, seed, running }: AmbientViewProps) {
  let tMs = useAmbientClock(running);
  let layer = scene.ambient(titleAmbience(tMs, seed, cols));

  return <SceneView testID="dawnAmbience" layers={[layer]} cell={cell} />;
}

export function DawnSceneView({
  cols,
  rows,
  cell,
  seed,
  skyTopRow = 0,
  horizonRow,
  reduceMotion = deviceReduceMotion,
}: DawnSceneViewProps) {
  let scene = useMemo(
    () => dawnScene(cols, rows, { skyTopRow, horizonRow }),
    [cols, rows, skyTopRow, horizonRow]
  );
  let reduced = useReduceMotion(reduceMotion);
  let focused = useIsFocused();

  return (
    <>
      <SceneView testID="dawnScene" layers={scene.layers} cell={cell} />
      <AmbientView
        scene={scene}
        cols={cols}
        cell={cell}
        seed={seed}
        running={focused && !reduced}
      />
    </>
  );
}
