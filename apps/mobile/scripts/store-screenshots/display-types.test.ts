import {
  knownFolderNames,
  MAX_SCREENSHOTS_PER_SET,
  problemsWithFolder,
  screenshotFolder,
  type FolderFile,
} from "./display-types";

const SIZE_6_9 = { width: 1320, height: 2868 };

function files(count: number, size: FolderFile["size"] = SIZE_6_9): FolderFile[] {
  return Array.from({ length: count }, (_unused, index) => ({
    fileName: `${String(index + 1).padStart(2, "0")}-shot.png`,
    size,
  }));
}

function folder6_9() {
  let folder = screenshotFolder("iphone-6.9");
  if (folder === null) {
    throw new Error("iphone-6.9 should be a known folder");
  }
  return folder;
}

test("puts 6.9 inch iPhone screenshots in the 6.7 inch display type at 1320x2868", () => {
  expect(screenshotFolder("iphone-6.9")).toEqual({
    displayType: "APP_IPHONE_67",
    size: { width: 1320, height: 2868 },
  });
});

test("knows no display type for a folder that is not in the table", () => {
  expect(screenshotFolder("iphone-6.5")).toBe(null);
  expect(screenshotFolder("toString")).toBe(null);
});

test("lists the folders it knows", () => {
  expect(knownFolderNames()).toEqual(["iphone-6.9"]);
});

test("finds nothing wrong with ordered PNGs of the expected size", () => {
  expect(problemsWithFolder(folder6_9(), files(5))).toEqual([]);
  expect(problemsWithFolder(folder6_9(), files(MAX_SCREENSHOTS_PER_SET))).toEqual([]);
});

test("names a screenshot that has the wrong size", () => {
  let wrong = [...files(1), { fileName: "02-shot.png", size: { width: 1290, height: 2796 } }];

  expect(problemsWithFolder(folder6_9(), wrong)).toEqual([
    "02-shot.png is 1290x2796, expected 1320x2868",
  ]);
});

test("does not accept a landscape screenshot of the right pixel count", () => {
  let landscape = [{ fileName: "01-shot.png", size: { width: 2868, height: 1320 } }];

  expect(problemsWithFolder(folder6_9(), landscape)).toEqual([
    "01-shot.png is 2868x1320, expected 1320x2868",
  ]);
});

test("names a file that is not a PNG", () => {
  expect(problemsWithFolder(folder6_9(), [{ fileName: "01-shot.png", size: null }])).toEqual([
    "01-shot.png is not a PNG file",
  ]);
});

test("names a file whose name does not carry the order", () => {
  let misnamed = [
    { fileName: "shot.png", size: SIZE_6_9 },
    { fileName: "1-shot.png", size: SIZE_6_9 },
    { fileName: "03-shot.jpg", size: SIZE_6_9 },
  ];

  expect(problemsWithFolder(folder6_9(), misnamed)).toEqual([
    "shot.png is not named like 01-name.png",
    "1-shot.png is not named like 01-name.png",
    "03-shot.jpg is not named like 01-name.png",
  ]);
});

test("refuses an empty folder so an upload never clears the store", () => {
  expect(problemsWithFolder(folder6_9(), [])).toEqual(["has no screenshots"]);
});

test("refuses more screenshots than a set can hold", () => {
  expect(problemsWithFolder(folder6_9(), files(11))).toEqual([
    "has 11 screenshots, and App Store Connect keeps at most 10",
  ]);
});

test("reports every problem in a folder together", () => {
  let mixed = [
    { fileName: "01-shot.png", size: { width: 100, height: 100 } },
    { fileName: "notes.txt", size: null },
  ];

  expect(problemsWithFolder(folder6_9(), mixed)).toEqual([
    "01-shot.png is 100x100, expected 1320x2868",
    "notes.txt is not named like 01-name.png",
    "notes.txt is not a PNG file",
  ]);
});
