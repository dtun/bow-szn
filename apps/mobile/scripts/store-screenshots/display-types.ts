import type { ScreenshotDisplayType } from "@expo/apple-utils";

import type { PixelSize } from "./png-size.ts";

export type DisplayTypeName = keyof typeof ScreenshotDisplayType;

export type ScreenshotFolder = {
  displayType: DisplayTypeName;
  size: PixelSize;
};

export type FolderFile = {
  fileName: string;
  size: PixelSize | null;
};

export const MAX_SCREENSHOTS_PER_SET = 10;

const SCREENSHOT_FOLDERS = {
  "iphone-6.9": { displayType: "APP_IPHONE_67", size: { width: 1320, height: 2868 } },
} as const satisfies Record<string, ScreenshotFolder>;

const ORDERED_PNG_NAME = /^\d{2}-.+\.png$/;

export function knownFolderNames(): string[] {
  return Object.keys(SCREENSHOT_FOLDERS);
}

export function screenshotFolder(name: string): ScreenshotFolder | null {
  return Object.entries(SCREENSHOT_FOLDERS).find(([key]) => key === name)?.[1] ?? null;
}

function problemsWithFile(folder: ScreenshotFolder, file: FolderFile): string[] {
  let problems: string[] = [];
  if (!ORDERED_PNG_NAME.test(file.fileName)) {
    problems.push(`${file.fileName} is not named like 01-name.png`);
  }
  if (file.size === null) {
    problems.push(`${file.fileName} is not a PNG file`);
  } else if (file.size.width !== folder.size.width || file.size.height !== folder.size.height) {
    problems.push(
      `${file.fileName} is ${file.size.width}x${file.size.height}, expected ${folder.size.width}x${folder.size.height}`
    );
  }
  return problems;
}

export function problemsWithFolder(
  folder: ScreenshotFolder,
  files: readonly FolderFile[]
): string[] {
  let problems: string[] = [];
  if (files.length === 0) {
    problems.push("has no screenshots");
  }
  if (files.length > MAX_SCREENSHOTS_PER_SET) {
    problems.push(
      `has ${files.length} screenshots, and App Store Connect keeps at most ${MAX_SCREENSHOTS_PER_SET}`
    );
  }
  return [...problems, ...files.flatMap((file) => problemsWithFile(folder, file))];
}
