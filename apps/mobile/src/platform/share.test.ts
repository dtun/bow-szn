import * as Sharing from "expo-sharing";

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

jest.mock("expo-sharing", () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

beforeEach(() => {
  mockOrder.length = 0;
  mockWrites.length = 0;
  jest.mocked(Sharing.shareAsync).mockImplementation(async () => {
    mockOrder.push("share");
  });
});

describe("the device sharer", () => {
  test("writes the PNG into the cache folder, then opens the share sheet on that file", async () => {
    jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(true);

    let result = await deviceSharer.sharePng("bow-season-42-3.png", PNG);

    expect(result).toEqual({ kind: "shared", uri: "file:///cache/bow-season-42-3.png" });
    expect(mockWrites).toEqual([{ uri: "file:///cache/bow-season-42-3.png", bytes: PNG }]);
    expect(mockOrder).toEqual(["create", "write", "share"]);
    expect(Sharing.shareAsync).toHaveBeenCalledWith("file:///cache/bow-season-42-3.png", {
      mimeType: "image/png",
      UTI: "public.png",
    });
  });

  test("writes nothing and opens nothing when sharing is not available", async () => {
    jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(false);

    let result = await deviceSharer.sharePng("bow-season-42-3.png", PNG);

    expect(result).toEqual({ kind: "unavailable" });
    expect(mockOrder).toEqual([]);
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });
});

describe("the fake sharer", () => {
  test("keeps each shared PNG under a uri that ends in the file name", async () => {
    let sharer = createFakeSharer();

    let result = await sharer.sharePng("bow-season-42-3.png", PNG);

    expect(result).toEqual({ kind: "shared", uri: `${FAKE_SHARE_FOLDER}/bow-season-42-3.png` });
    expect(sharer.shared).toEqual([
      { uri: `${FAKE_SHARE_FOLDER}/bow-season-42-3.png`, bytes: PNG },
    ]);
  });

  test("keeps nothing when it is made unavailable", async () => {
    let sharer = createFakeSharer(false);

    let result = await sharer.sharePng("bow-season-42-3.png", PNG);

    expect(result).toEqual({ kind: "unavailable" });
    expect(sharer.shared).toEqual([]);
  });
});
