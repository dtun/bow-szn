import type { Harvest } from "@bow-szn/core";
import { PALETTE, SPRITES } from "@bow-szn/pixels";
import { Group, Rect, Text as SkiaText, type SkFont } from "@shopify/react-native-skia";

import { SpriteRects } from "@/art/pixel-sprite";

import { mountSprite } from "./mount-sprite";
import { plateLines } from "./plate-lines";
import { CARD_PX, CARD_SCALE, SCAN_LABEL, cardLayout } from "./trophy-card-layout";
import { PlankRects } from "./wood-wall";

type TrophyCardProps = {
  harvest: Harvest;
  font: SkFont;
};

export function TrophyCard({ harvest, font }: TrophyCardProps) {
  let mount = mountSprite(harvest);
  let wordmark = SPRITES["logo-wordmark"];
  let qr = SPRITES["qr-site"];
  let layout = cardLayout(mount, wordmark, qr);
  let { plate } = layout;
  let lines = plateLines(harvest);
  let texts = [lines.record, lines.score, lines.spot, lines.when];

  return (
    <Group>
      <PlankRects width={CARD_PX.width} height={CARD_PX.height} />
      <Group transform={[{ scale: CARD_SCALE }]}>
        <SpriteRects
          sprite={mount}
          x={layout.mount.x}
          y={layout.mount.y}
          scale={layout.mount.scale}
        />
        <Rect x={plate.x} y={plate.y} width={plate.width} height={plate.height} color={PALETTE.y} />
        <Rect
          x={plate.x + plate.border}
          y={plate.y + plate.border}
          width={layout.textWidth}
          height={plate.height - 2 * plate.border}
          color={PALETTE.Y}
        />
        {texts.map((text, index) => (
          <SkiaText
            key={index}
            x={Math.round(layout.textCenterX - font.measureText(text).width / 2)}
            y={layout.baselines[index]}
            text={text}
            font={font}
            color={PALETTE.E}
          />
        ))}
        <SpriteRects sprite={wordmark} x={layout.wordmark.x} y={layout.wordmark.y} scale={1} />
        <SkiaText
          x={Math.round(layout.scanLabel.centerX - font.measureText(SCAN_LABEL).width / 2)}
          y={layout.scanLabel.baseline}
          text={SCAN_LABEL}
          font={font}
          color={PALETTE.C}
        />
        <SpriteRects sprite={qr} x={layout.qr.x} y={layout.qr.y} scale={layout.qr.scale} />
      </Group>
    </Group>
  );
}
