import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

export type ShareResult = { kind: "shared"; uri: string } | { kind: "unavailable" };

export type Sharer = {
  sharePng(fileName: string, png: Uint8Array): Promise<ShareResult>;
};

export const deviceSharer: Sharer = {
  async sharePng(fileName, png) {
    if (!(await Sharing.isAvailableAsync())) {
      return { kind: "unavailable" };
    }
    let file = new File(Paths.cache, fileName);
    file.create({ overwrite: true });
    file.write(png);
    await Sharing.shareAsync(file.uri, { mimeType: "image/png", UTI: "public.png" });
    return { kind: "shared", uri: file.uri };
  },
};

export type SharedFile = { uri: string; bytes: Uint8Array };

export type FakeSharer = Sharer & { shared: SharedFile[] };

export const FAKE_SHARE_FOLDER = "file:///fake-cache";

export function createFakeSharer(available: boolean = true): FakeSharer {
  let shared: SharedFile[] = [];
  return {
    shared,
    async sharePng(fileName, png) {
      if (!available) {
        return { kind: "unavailable" };
      }
      let uri = `${FAKE_SHARE_FOLDER}/${fileName}`;
      shared.push({ uri, bytes: png });
      return { kind: "shared", uri };
    },
  };
}
