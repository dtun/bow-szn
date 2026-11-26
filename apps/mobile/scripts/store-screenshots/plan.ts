export type LocalScreenshot = {
  fileName: string;
  byteSize: number;
  md5: string;
};

export type RemoteScreenshot = {
  id: string;
  fileName: string;
  byteSize: number;
  md5: string | null;
  processed: boolean;
};

export type PlanStep =
  | { kind: "delete"; id: string; fileName: string }
  | { kind: "upload"; fileName: string };

function isSameScreenshot(local: LocalScreenshot, remote: RemoteScreenshot): boolean {
  return (
    remote.processed &&
    local.fileName === remote.fileName &&
    local.byteSize === remote.byteSize &&
    (remote.md5 === null || local.md5.toLowerCase() === remote.md5.toLowerCase())
  );
}

export function planScreenshotSync(
  local: readonly LocalScreenshot[],
  remote: readonly RemoteScreenshot[]
): PlanStep[] {
  let kept = 0;
  while (
    kept < local.length &&
    kept < remote.length &&
    isSameScreenshot(local[kept], remote[kept])
  ) {
    kept += 1;
  }
  return [
    ...remote.slice(kept).map(
      (screenshot): PlanStep => ({
        kind: "delete",
        id: screenshot.id,
        fileName: screenshot.fileName,
      })
    ),
    ...local.slice(kept).map(
      (screenshot): PlanStep => ({
        kind: "upload",
        fileName: screenshot.fileName,
      })
    ),
  ];
}
