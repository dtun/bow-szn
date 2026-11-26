export type Palette = Readonly<Record<string, string>>;

export type Sprite = {
  name: string;
  w: number;
  h: number;
  rows: readonly string[];
};
