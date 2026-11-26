import {
  planScreenshotSync,
  type LocalScreenshot,
  type PlanStep,
  type RemoteScreenshot,
} from "./plan";

function localFile(fileName: string, md5: string, byteSize = 100): LocalScreenshot {
  return { fileName, byteSize, md5 };
}

function remoteFile(
  id: string,
  fileName: string,
  md5: string | null,
  overrides: Partial<RemoteScreenshot> = {}
): RemoteScreenshot {
  return { id, fileName, byteSize: 100, md5, processed: true, ...overrides };
}

function applyPlan(
  remote: readonly RemoteScreenshot[],
  plan: readonly PlanStep[],
  local: readonly LocalScreenshot[]
): RemoteScreenshot[] {
  let result = [...remote];
  for (let step of plan) {
    if (step.kind === "delete") {
      result = result.filter((screenshot) => screenshot.id !== step.id);
      continue;
    }
    for (let file of local) {
      if (file.fileName === step.fileName) {
        result.push({
          id: `uploaded-${file.fileName}`,
          fileName: file.fileName,
          byteSize: file.byteSize,
          md5: file.md5,
          processed: true,
        });
      }
    }
  }
  return result;
}

const FIRST = localFile("01-draw.png", "aaaa");
const SECOND = localFile("02-aim.png", "bbbb");
const THIRD = localFile("03-hunt.png", "cccc");

const REMOTE_FIRST = remoteFile("r1", "01-draw.png", "aaaa");
const REMOTE_SECOND = remoteFile("r2", "02-aim.png", "bbbb");
const REMOTE_THIRD = remoteFile("r3", "03-hunt.png", "cccc");

test("uploads every file in order when the remote set is empty", () => {
  expect(planScreenshotSync([FIRST, SECOND, THIRD], [])).toEqual([
    { kind: "upload", fileName: "01-draw.png" },
    { kind: "upload", fileName: "02-aim.png" },
    { kind: "upload", fileName: "03-hunt.png" },
  ]);
});

test("does nothing when every name, size, and checksum already matches", () => {
  expect(
    planScreenshotSync([FIRST, SECOND, THIRD], [REMOTE_FIRST, REMOTE_SECOND, REMOTE_THIRD])
  ).toEqual([]);
});

test("replaces a changed last file by deleting it and uploading it again", () => {
  let changed = localFile("03-hunt.png", "dddd");

  expect(
    planScreenshotSync([FIRST, SECOND, changed], [REMOTE_FIRST, REMOTE_SECOND, REMOTE_THIRD])
  ).toEqual([
    { kind: "delete", id: "r3", fileName: "03-hunt.png" },
    { kind: "upload", fileName: "03-hunt.png" },
  ]);
});

test("re-uploads every file after a changed one so the remote order stays the local order", () => {
  let changed = localFile("02-aim.png", "eeee");
  let local = [FIRST, changed, THIRD];
  let remote = [REMOTE_FIRST, REMOTE_SECOND, REMOTE_THIRD];

  expect(planScreenshotSync(local, remote)).toEqual([
    { kind: "delete", id: "r2", fileName: "02-aim.png" },
    { kind: "delete", id: "r3", fileName: "03-hunt.png" },
    { kind: "upload", fileName: "02-aim.png" },
    { kind: "upload", fileName: "03-hunt.png" },
  ]);
});

test("deletes remote files that are no longer local", () => {
  expect(planScreenshotSync([FIRST], [REMOTE_FIRST, REMOTE_SECOND, REMOTE_THIRD])).toEqual([
    { kind: "delete", id: "r2", fileName: "02-aim.png" },
    { kind: "delete", id: "r3", fileName: "03-hunt.png" },
  ]);
});

test("deletes the whole remote set when there are no local files", () => {
  expect(planScreenshotSync([], [REMOTE_FIRST, REMOTE_SECOND])).toEqual([
    { kind: "delete", id: "r1", fileName: "01-draw.png" },
    { kind: "delete", id: "r2", fileName: "02-aim.png" },
  ]);
});

test("treats a renamed file as a replacement", () => {
  let renamed = localFile("02-wind.png", "bbbb");

  expect(planScreenshotSync([FIRST, renamed], [REMOTE_FIRST, REMOTE_SECOND])).toEqual([
    { kind: "delete", id: "r2", fileName: "02-aim.png" },
    { kind: "upload", fileName: "02-wind.png" },
  ]);
});

test("replaces a remote screenshot whose processing never finished", () => {
  let stuck = remoteFile("r2", "02-aim.png", "bbbb", { processed: false });

  expect(planScreenshotSync([FIRST, SECOND], [REMOTE_FIRST, stuck])).toEqual([
    { kind: "delete", id: "r2", fileName: "02-aim.png" },
    { kind: "upload", fileName: "02-aim.png" },
  ]);
});

test("compares checksums without regard to letter case", () => {
  let shouting = remoteFile("r1", "01-draw.png", "AAAA");

  expect(planScreenshotSync([FIRST], [shouting])).toEqual([]);
});

test("falls back to the file size when the remote has no checksum", () => {
  let unchecked = remoteFile("r1", "01-draw.png", null);
  let resized = localFile("01-draw.png", "aaaa", 250);

  expect(planScreenshotSync([FIRST], [unchecked])).toEqual([]);
  expect(planScreenshotSync([resized], [unchecked])).toEqual([
    { kind: "delete", id: "r1", fileName: "01-draw.png" },
    { kind: "upload", fileName: "01-draw.png" },
  ]);
});

test.each([
  ["an empty set", [FIRST, SECOND, THIRD], []],
  [
    "a changed middle file",
    [FIRST, localFile("02-aim.png", "eeee"), THIRD],
    [REMOTE_FIRST, REMOTE_SECOND, REMOTE_THIRD],
  ],
  ["a shorter local set", [FIRST], [REMOTE_FIRST, REMOTE_SECOND, REMOTE_THIRD]],
  ["a longer local set", [FIRST, SECOND, THIRD], [REMOTE_FIRST]],
  [
    "a stuck upload",
    [FIRST, SECOND],
    [REMOTE_FIRST, remoteFile("r2", "02-aim.png", null, { processed: false })],
  ],
  ["a reordered set", [SECOND, FIRST, THIRD], [REMOTE_FIRST, REMOTE_SECOND, REMOTE_THIRD]],
])("after applying the plan for %s, a second plan has nothing to do", (_name, local, remote) => {
  let converged = applyPlan(remote, planScreenshotSync(local, remote), local);

  expect(converged.map((screenshot) => screenshot.fileName)).toEqual(
    local.map((file) => file.fileName)
  );
  expect(planScreenshotSync(local, converged)).toEqual([]);
});
