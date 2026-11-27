import { createHash } from "node:crypto";
import type { Dirent } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type {
  AppScreenshot,
  AppScreenshotSet,
  AppStoreVersion,
  AppStoreVersionLocalization,
  RequestContext,
} from "@expo/apple-utils";

import appConfig from "../../app.json" with { type: "json" };
import {
  knownFolderNames,
  problemsWithFolder,
  screenshotFolder,
  type FolderFile,
  type ScreenshotFolder,
} from "./display-types.ts";
import {
  planScreenshotSync,
  type LocalScreenshot,
  type PlanStep,
  type RemoteScreenshot,
} from "./plan.ts";
import { readPngSize } from "./png-size.ts";

type AppleUtils = typeof import("@expo/apple-utils");

type Options = { dryRun: boolean; screenshotsDir: string };

type LocalFile = LocalScreenshot & FolderFile;

type LocalFolder = { name: string; dir: string; folder: ScreenshotFolder; files: LocalFile[] };

const LOCALE = "en-US";
const FIRST_UNSUPPORTED_NODE_MAJOR = 26;
const DEFAULT_SCREENSHOTS_DIR = fileURLToPath(new URL("../../store/screenshots", import.meta.url));
const USAGE = "Usage: npm run store:screenshots -- [--dry-run] [--dir <screenshots folder>]";
const RERUN_NOTE = "Run the command again. It starts from what App Store Connect holds now.";

const nodeRequire = createRequire(import.meta.url);

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function refuseUnsupportedNode(): void {
  let major = Number(process.versions.node.split(".")[0]);
  if (major >= FIRST_UNSUPPORTED_NODE_MAJOR) {
    throw new Error(
      `Node ${process.versions.node} cannot sign in to Apple. Run: fnm exec --using=22 npm run store:screenshots`
    );
  }
}

function parseOptions(args: string[]): Options {
  let options: Options = { dryRun: false, screenshotsDir: DEFAULT_SCREENSHOTS_DIR };
  for (let index = 0; index < args.length; index += 1) {
    let arg = args[index];
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--dir" && args[index + 1] !== undefined) {
      options.screenshotsDir = path.resolve(args[index + 1]);
      index += 1;
    } else {
      throw new Error(`Unknown argument ${arg}. ${USAGE}`);
    }
  }
  return options;
}

async function listEntries(dir: string): Promise<Dirent[]> {
  try {
    return await readdir(dir, { withFileTypes: true });
  } catch {
    throw new Error(`Cannot read ${dir}. Pass the screenshots folder with --dir.`);
  }
}

async function readLocalFile(dir: string, fileName: string): Promise<LocalFile> {
  let bytes = await readFile(path.join(dir, fileName));
  return {
    fileName,
    byteSize: bytes.byteLength,
    md5: createHash("md5").update(bytes).digest("hex"),
    size: readPngSize(bytes),
  };
}

async function readLocalFolder(
  screenshotsDir: string,
  name: string,
  folder: ScreenshotFolder
): Promise<LocalFolder> {
  let dir = path.join(screenshotsDir, name);
  let fileNames = (await listEntries(dir))
    .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort();
  let files = await Promise.all(fileNames.map((fileName) => readLocalFile(dir, fileName)));
  return { name, dir, folder, files };
}

async function loadLocalFolders(screenshotsDir: string): Promise<LocalFolder[]> {
  let folderNames = (await listEntries(screenshotsDir))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  let known = knownFolderNames().join(", ");
  let problems: string[] = [];
  let folders: LocalFolder[] = [];
  if (folderNames.length === 0) {
    problems.push(`${screenshotsDir} has no screenshot folders. Known folders: ${known}`);
  }
  for (let name of folderNames) {
    let folder = screenshotFolder(name);
    if (folder === null) {
      problems.push(`${name}: no display type for this folder. Known folders: ${known}`);
      continue;
    }
    let local = await readLocalFolder(screenshotsDir, name, folder);
    problems.push(
      ...problemsWithFolder(folder, local.files).map((problem) => `${name}: ${problem}`)
    );
    folders.push(local);
  }
  if (problems.length > 0) {
    throw new Error(
      `Nothing was sent to App Store Connect. Fix these first:\n${problems.map((problem) => `  ${problem}`).join("\n")}`
    );
  }
  return folders;
}

async function authenticate(apple: AppleUtils): Promise<RequestContext> {
  let credentials = {
    username: process.env.EXPO_APPLE_ID,
    teamId: process.env.EXPO_APPLE_TEAM_ID,
  };
  let options = { autoResolveProvider: true };
  if (process.stdin.isTTY) {
    return (await apple.Auth.loginAsync(credentials, options)).context;
  }
  if (!credentials.username) {
    throw new Error(
      "Set EXPO_APPLE_ID so the saved Apple session can be restored without a terminal."
    );
  }
  apple.Auth.resetInMemoryData();
  let restored = await apple.Auth.tryRestoringAuthStateFromUserCredentialsAsync(
    credentials,
    options
  );
  if (restored === null) {
    throw new Error(
      "The saved Apple session is missing or expired. Run this from a terminal to sign in with your password and 2FA code."
    );
  }
  return restored.context;
}

async function findEditableVersion(
  apple: AppleUtils,
  context: RequestContext
): Promise<AppStoreVersion> {
  let bundleId = appConfig.expo.ios.bundleIdentifier;
  let app = await apple.App.findAsync(context, { bundleId });
  if (app === null) {
    throw new Error(`No app with bundle id ${bundleId} in this App Store Connect team.`);
  }
  let version = await app.getEditAppStoreVersionAsync({ platform: apple.Platform.IOS });
  if (version === null) {
    throw new Error(`${app.attributes.name} has no iOS version open for editing.`);
  }
  console.log(
    `${app.attributes.name} (${app.id}) version ${version.attributes.versionString}, ${version.attributes.appStoreState}`
  );
  return version;
}

function toRemote(screenshot: AppScreenshot): RemoteScreenshot {
  return {
    id: screenshot.id,
    fileName: screenshot.attributes.fileName,
    byteSize: screenshot.attributes.fileSize,
    md5: screenshot.attributes.sourceFileChecksum ?? null,
    processed: screenshot.isComplete(),
  };
}

function describeStep(step: PlanStep): string {
  return `${step.kind} ${step.fileName}`;
}

async function attempt(description: string, action: () => Promise<unknown>): Promise<void> {
  try {
    await action();
  } catch (error) {
    throw new Error(`Could not ${description}: ${errorMessage(error)}\n${RERUN_NOTE}`);
  }
}

async function applyPlan(
  apple: AppleUtils,
  context: RequestContext,
  set: AppScreenshotSet,
  local: LocalFolder,
  plan: PlanStep[]
): Promise<void> {
  for (let step of plan) {
    if (step.kind === "delete") {
      await attempt(describeStep(step), () =>
        apple.AppScreenshot.deleteAsync(context, { id: step.id })
      );
    } else {
      await attempt(describeStep(step), () =>
        set.uploadScreenshot({
          filePath: path.join(local.dir, step.fileName),
          waitForProcessing: true,
        })
      );
    }
    console.log(`  done: ${describeStep(step)}`);
  }
}

async function verifySet(
  apple: AppleUtils,
  localization: AppStoreVersionLocalization,
  local: LocalFolder
): Promise<void> {
  let settled = await findSet(localization, local.folder, apple);
  let remote = settled === null ? [] : settled.attributes.appScreenshots.map(toRemote);
  let leftover = planScreenshotSync(local.files, remote);
  if (leftover.length > 0) {
    throw new Error(
      `App Store Connect still differs from ${local.name} after the upload: ${leftover.map(describeStep).join(", ")}.\n${RERUN_NOTE}`
    );
  }
  console.log(`  ${local.files.length} screenshots in place, in order`);
}

async function findSet(
  localization: AppStoreVersionLocalization | null,
  folder: ScreenshotFolder,
  apple: AppleUtils
): Promise<AppScreenshotSet | null> {
  if (localization === null) {
    return null;
  }
  let sets = await localization.getAppScreenshotSetsAsync();
  let displayType = apple.ScreenshotDisplayType[folder.displayType];
  return sets.find((set) => set.attributes.screenshotDisplayType === displayType) ?? null;
}

async function syncFolders(
  apple: AppleUtils,
  context: RequestContext,
  version: AppStoreVersion,
  folders: LocalFolder[],
  options: Options
): Promise<void> {
  let localizations = await version.getLocalizationsAsync();
  let localization = localizations.find((entry) => entry.attributes.locale === LOCALE) ?? null;
  for (let local of folders) {
    let set = await findSet(localization, local.folder, apple);
    let remote = set === null ? [] : set.attributes.appScreenshots.map(toRemote);
    let plan = planScreenshotSync(local.files, remote);
    console.log(
      `${local.name} -> ${local.folder.displayType} (${LOCALE}): ${local.files.length} local, ${remote.length} in App Store Connect`
    );
    console.log(
      plan.length === 0 ? "  up to date" : plan.map((step) => `  ${describeStep(step)}`).join("\n")
    );
    if (options.dryRun || plan.length === 0) {
      continue;
    }
    localization = localization ?? (await version.createLocalizationAsync({ locale: LOCALE }));
    set =
      set ??
      (await localization.createAppScreenshotSetAsync({
        screenshotDisplayType: apple.ScreenshotDisplayType[local.folder.displayType],
      }));
    await applyPlan(apple, context, set, local, plan);
    await verifySet(apple, localization, local);
  }
}

async function main(): Promise<void> {
  refuseUnsupportedNode();
  let options = parseOptions(process.argv.slice(2));
  let folders = await loadLocalFolders(options.screenshotsDir);
  let count = folders.reduce((total, local) => total + local.files.length, 0);
  console.log(
    `Checked ${count} screenshots in ${folders.length} folder(s) under ${options.screenshotsDir}`
  );
  let apple: AppleUtils = nodeRequire("@expo/apple-utils");
  let context = await authenticate(apple);
  let version = await findEditableVersion(apple, context);
  await syncFolders(apple, context, version, folders, options);
  console.log(options.dryRun ? "Dry run: nothing was changed in App Store Connect." : "Done.");
}

try {
  await main();
} catch (error) {
  console.error(errorMessage(error));
  process.exitCode = 1;
}
