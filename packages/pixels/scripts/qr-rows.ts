import QRCode from "qrcode";

export const QR_DARK = "S";
export const QR_LIGHT = "C";
export const QR_QUIET_ZONE = 4;
export const QR_SPRITE_ID = "qr-site";

export function qrRows(url: string): string[] {
  let { modules } = QRCode.create(url, { errorCorrectionLevel: "M" });
  let side = modules.size + 2 * QR_QUIET_ZONE;
  return Array.from({ length: side }, (_, y) =>
    Array.from({ length: side }, (_, x) => {
      let row = y - QR_QUIET_ZONE;
      let col = x - QR_QUIET_ZONE;
      let inside = row >= 0 && col >= 0 && row < modules.size && col < modules.size;
      return inside && modules.get(row, col) ? QR_DARK : QR_LIGHT;
    }).join("")
  );
}

export function qrSpriteSource(url: string): string {
  let rows = qrRows(url).map((row) => `    "${row}",`);
  return [
    'import { defineSprites } from "../compose.ts";',
    'import type { Sprite } from "../types.ts";',
    "",
    `export type QrSpriteId = "${QR_SPRITE_ID}";`,
    "",
    "export const QR_SPRITES: Record<QrSpriteId, Sprite> = defineSprites({",
    `  "${QR_SPRITE_ID}": [`,
    ...rows,
    "  ],",
    "});",
    "",
  ].join("\n");
}
