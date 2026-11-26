import { MOUNT_FRAMES, SPRITES } from "./index.ts";
import type { MountableKind } from "./index.ts";

const MOUNT_KINDS: MountableKind[] = ["buck-small", "buck-medium", "buck-large", "elk-bull"];

function antlerPixels(kind: MountableKind): number {
  return SPRITES[MOUNT_FRAMES[kind]].rows.join("").replace(/[^Aa]/g, "").length;
}

describe("MOUNT_FRAMES", () => {
  it("mounts a buck of every rack size and the elk bull", () => {
    expect(Object.keys(MOUNT_FRAMES).sort()).toEqual([...MOUNT_KINDS].sort());
  });

  it("grows the rack from small to medium to large to the elk bull", () => {
    let sizes = MOUNT_KINDS.map(antlerPixels);

    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    expect(new Set(sizes).size).toBe(sizes.length);
  });

  it("hangs every mount on a plaque of the same width", () => {
    expect(new Set(MOUNT_KINDS.map((kind) => SPRITES[MOUNT_FRAMES[kind]].w)).size).toBe(1);
  });

  it("carries a brass plate on every mount", () => {
    for (let kind of MOUNT_KINDS) {
      expect(SPRITES[MOUNT_FRAMES[kind]].rows.join("")).toMatch(/Y+/);
    }
  });
});
