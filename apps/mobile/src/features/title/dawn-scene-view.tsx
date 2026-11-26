import { useMemo } from "react";

import { SceneView } from "@/art/scene-view";

import { dawnScene } from "./dawn-scene";

type DawnSceneViewProps = {
  cols: number;
  rows: number;
  cell: number;
};

export function DawnSceneView({ cols, rows, cell }: DawnSceneViewProps) {
  let scene = useMemo(() => dawnScene(cols, rows), [cols, rows]);

  return <SceneView testID="dawnScene" layers={scene.layers} cell={cell} />;
}
