import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { SOUNDS, SOUND_IDS, SOUND_SAMPLE_RATE, render } from "../src/index.ts";
import { peak } from "../src/measure.ts";
import { encodeWav } from "../src/wav.ts";

const OUTPUT_DIR = resolve(dirname(process.argv[1]), "../../../apps/mobile/assets/sound");

type Row = { id: string; kind: string; seconds: number; peak: number; bytes: number };

function table(rows: Row[]): string {
  let total = rows.reduce((sum, row) => sum + row.bytes, 0);
  let lines = [
    "# Sound report",
    "",
    `Mono, 16-bit PCM, ${SOUND_SAMPLE_RATE} Hz. Files are in apps/mobile/assets/sound.`,
    "",
    "| id | kind | duration (s) | peak | file size (bytes) |",
    "| --- | --- | --- | --- | --- |",
    ...rows.map(
      (row) =>
        `| ${row.id} | ${row.kind} | ${row.seconds.toFixed(3)} | ${row.peak.toFixed(3)} | ${row.bytes} |`
    ),
    `| total | | | | ${total} |`,
  ];
  return lines.join("\n");
}

mkdirSync(OUTPUT_DIR, { recursive: true });

let rows: Row[] = [];
for (let id of SOUND_IDS) {
  let samples = render(SOUNDS[id], SOUND_SAMPLE_RATE);
  let wav = encodeWav(samples, SOUND_SAMPLE_RATE);
  writeFileSync(resolve(OUTPUT_DIR, `${id}.wav`), wav);
  rows.push({
    id,
    kind: SOUNDS[id].kind,
    seconds: samples.length / SOUND_SAMPLE_RATE,
    peak: peak(samples),
    bytes: wav.length,
  });
}

console.log(table(rows));
