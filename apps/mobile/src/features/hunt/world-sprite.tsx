import { Group, Picture } from "@shopify/react-native-skia";

import { ART, type ArtId } from "./hunt-art";
import { spritePicture } from "./sprite-pictures";

type WorldSpriteProps = {
  id: ArtId;
  x: number;
  y: number;
  flip?: boolean;
  tint?: string | null;
  rotate?: number;
};

export function WorldSprite({ id, x, y, flip = false, tint = null, rotate = 0 }: WorldSpriteProps) {
  let sprite = ART[id];
  return (
    <Group
      transform={[
        { translateX: x },
        { translateY: y },
        { rotate },
        { scaleX: flip ? -1 : 1 },
        { translateX: -Math.floor(sprite.w / 2) },
        { translateY: -sprite.h },
      ]}
    >
      <Picture picture={spritePicture(sprite, tint)} />
    </Group>
  );
}
