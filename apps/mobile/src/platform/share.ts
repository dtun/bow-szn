import { File, Paths } from "expo-file-system";
import { Share } from "react-native";

export type ShareCard = { fileName: string; png: Uint8Array; message: string };

export type ShareResult = { kind: "shared"; uri: string };

export type Sharer = {
  sharePng(card: ShareCard): Promise<ShareResult>;
};

export const deviceSharer: Sharer = {
  async sharePng({ fileName, png, message }) {
    let file = new File(Paths.cache, fileName);
    file.create({ overwrite: true });
    file.write(png);
    await Share.share({ url: file.uri, message });
    return { kind: "shared", uri: file.uri };
  },
};

export type SharedCard = { uri: string; bytes: Uint8Array; message: string };

export type FakeSharer = Sharer & { shared: SharedCard[] };

export const FAKE_SHARE_FOLDER = "file:///fake-cache";

export function createFakeSharer(): FakeSharer {
  let shared: SharedCard[] = [];
  return {
    shared,
    async sharePng({ fileName, png, message }) {
      let uri = `${FAKE_SHARE_FOLDER}/${fileName}`;
      shared.push({ uri, bytes: png, message });
      return { kind: "shared", uri };
    },
  };
}
