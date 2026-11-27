import jsQR from "jsqr";

import { QR_DARK, QR_LIGHT, QR_QUIET_ZONE, qrRows } from "../scripts/qr-rows.ts";
import { PALETTE, QR_SITE_URL, SPRITES, rasterize } from "./index.ts";

const QR = SPRITES["qr-site"];

function luminance(hex: string): number {
  let [r, g, b] = [1, 3, 5].map((at) => {
    let channel = parseInt(hex.slice(at, at + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  let [bright, dim] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (bright + 0.05) / (dim + 0.05);
}

describe("qr-site", () => {
  it("is the QR code the generator makes for the site link", () => {
    expect(QR.rows).toEqual(qrRows(QR_SITE_URL));
  });

  it("is a square of two characters, dark modules and light ones", () => {
    expect(QR.w).toBe(QR.h);
    expect(new Set(QR.rows.join(""))).toEqual(new Set([QR_DARK, QR_LIGHT]));
  });

  it("draws dark modules on light with a contrast that scans on the wood wall", () => {
    expect(contrast(PALETTE[QR_DARK], PALETTE[QR_LIGHT])).toBeGreaterThanOrEqual(10);
  });

  it("keeps a light quiet zone of four modules on every side", () => {
    let edges = [
      ...QR.rows.slice(0, QR_QUIET_ZONE),
      ...QR.rows.slice(QR.h - QR_QUIET_ZONE),
      ...QR.rows.map((row) => row.slice(0, QR_QUIET_ZONE)),
      ...QR.rows.map((row) => row.slice(QR.w - QR_QUIET_ZONE)),
    ];

    expect(QR_QUIET_ZONE).toBe(4);
    expect(edges.every((edge) => edge === QR_LIGHT.repeat(edge.length))).toBe(true);
  });

  it.each([3, 4])("decodes back to the site link when drawn at %i pixels per module", (scale) => {
    let { width, height, rgba } = rasterize(QR, PALETTE, scale);

    let found = jsQR(new Uint8ClampedArray(rgba), width, height, {
      inversionAttempts: "dontInvert",
    });

    expect(found?.data).toBe(QR_SITE_URL);
  });
});
