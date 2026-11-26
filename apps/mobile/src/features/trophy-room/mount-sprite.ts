import type { Harvest } from "@bow-szn/core";
import {
  MOUNT_FRAMES,
  SPRITES,
  whitetailKind,
  type MountableKind,
  type Sprite,
} from "@bow-szn/pixels";

function mountKind(harvest: Harvest): MountableKind {
  if (harvest.species === "elk") {
    return "elk-bull";
  }
  let kind = whitetailKind(harvest.antlers);
  return kind === "buck-medium" || kind === "buck-large" ? kind : "buck-small";
}

export function mountSprite(harvest: Harvest): Sprite {
  return SPRITES[MOUNT_FRAMES[mountKind(harvest)]];
}
