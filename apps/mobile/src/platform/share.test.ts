import { Share } from "react-native";

import { createFakeSharer, deviceSharer, FAKE_SHARE_FOLDER } from "./share";

const mockOrder: string[] = [];
const mockWrites: { uri: string; bytes: Uint8Array }[] = [];

jest.mock("expo-file-system", () => {
  class MockFile {
    uri: string;

    constructor(folder: { uri: string }, name: string) {
      this.uri = `${folder.uri}/${name}`;
    }

    create() {
      mockOrder.push("create");
    }

    write(bytes: Uint8Array) {
      mockOrder.push("write");
      mockWrites.push({ uri: this.uri, bytes });
    }
  }
  return { File: MockFile, Paths: { cache: { uri: "file:///cache" } } };
});

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MESSAGE = "PLAY THE BETA: https://testflight.apple.com/join/M3zeJD6U";
const CARD = { fileName: "bow-season-42-3.png", png: PNG, message: MESSAGE };

let shareSheet: jest.SpyInstance;

beforeEach(() => {
  mockOrder.length = 0;
  mockWrites.length = 0;
  shareSheet = jest.spyOn(Share, "share").mockImplementation(async () => {
    mockOrder.push("share");
    return { action: Share.sharedAction };
  });
});

afterEach(() => {
  shareSheet.mockRestore();
});

describe("the device sharer", () => {
  test("writes the PNG into the cache folder, then opens the share sheet on that file with the message", async () => {
    let result = await deviceSharer.sharePng(CARD);

    expect(result).toEqual({ kind: "shared", uri: "file:///cache/bow-season-42-3.png" });
    expect(mockWrites).toEqual([{ uri: "file:///cache/bow-season-42-3.png", bytes: PNG }]);
    expect(mockOrder).toEqual(["create", "write", "share"]);
    expect(shareSheet).toHaveBeenCalledTimes(1);
    expect(shareSheet).toHaveBeenCalledWith({
      url: "file:///cache/bow-season-42-3.png",
      message: MESSAGE,
    });
  });

  test("lets the failure reach the caller when the share sheet fails", async () => {
    shareSheet.mockRejectedValue(new Error("sheet refused"));

    await expect(deviceSharer.sharePng(CARD)).rejects.toThrow("sheet refused");
  });
});

describe("the fake sharer", () => {
  test("keeps each shared card under a uri that ends in the file name, with its message", async () => {
    let sharer = createFakeSharer();

    let result = await sharer.sharePng(CARD);

    expect(result).toEqual({ kind: "shared", uri: `${FAKE_SHARE_FOLDER}/bow-season-42-3.png` });
    expect(sharer.shared).toEqual([
      { uri: `${FAKE_SHARE_FOLDER}/bow-season-42-3.png`, bytes: PNG, message: MESSAGE },
    ]);
  });
});
