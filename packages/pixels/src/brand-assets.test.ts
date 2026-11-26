import { renderBrandFiles } from "./brand-assets.ts";
import { decodePng } from "./test-support/read-png.ts";

const COLOR_TYPE_RGB = 2;
const COLOR_TYPE_RGBA = 6;

function decoded(name: string) {
  let file = renderBrandFiles().find((candidate) => candidate.name === name);
  if (!file) {
    throw new Error(`no brand file named ${name}`);
  }
  return decodePng(file.bytes);
}

describe("renderBrandFiles", () => {
  it("renders the five brand files the design lists", () => {
    expect(renderBrandFiles().map((file) => file.name)).toEqual([
      "icon.png",
      "splash.png",
      "adaptive-foreground.png",
      "adaptive-background.png",
      "favicon.png",
    ]);
  });

  it("renders the icon at 1024 by 1024 as RGB with no alpha channel", () => {
    let icon = decoded("icon.png");

    expect([icon.width, icon.height, icon.colorType]).toEqual([1024, 1024, COLOR_TYPE_RGB]);
    expect(icon.samples).toHaveLength(1024 * 1024 * 3);
  });

  it("paints the icon's top-left corner in deep navy", () => {
    expect(Array.from(decoded("icon.png").samples.subarray(0, 3))).toEqual([0x13, 0x21, 0x4a]);
  });

  it("renders the splash at 1024 by 1024 on the #0b0f1a background", () => {
    let splash = decoded("splash.png");

    expect([splash.width, splash.height, splash.colorType]).toEqual([1024, 1024, COLOR_TYPE_RGB]);
    expect(Array.from(splash.samples.subarray(0, 3))).toEqual([0x0b, 0x0f, 0x1a]);
  });

  it("renders the adaptive foreground with an alpha channel and a clear corner", () => {
    let foreground = decoded("adaptive-foreground.png");

    expect([foreground.width, foreground.height, foreground.colorType]).toEqual([
      1024,
      1024,
      COLOR_TYPE_RGBA,
    ]);
    expect(Array.from(foreground.samples.subarray(0, 4))).toEqual([0, 0, 0, 0]);
  });

  it("renders the adaptive background opaque at 1024 by 1024", () => {
    let background = decoded("adaptive-background.png");

    expect([background.width, background.height, background.colorType]).toEqual([
      1024,
      1024,
      COLOR_TYPE_RGB,
    ]);
  });

  it("renders the favicon at 48 by 48", () => {
    let favicon = decoded("favicon.png");

    expect([favicon.width, favicon.height]).toEqual([48, 48]);
  });
});
