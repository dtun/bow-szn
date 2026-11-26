# @bow-szn/sound

Original 8-bit sound effects and two jingles for Bow Season. Every sound is data. A pure renderer turns the data into samples, and a script writes the samples to WAV files for the app. No audio file is made by hand and no sample comes from elsewhere.

## Use

```ts
import { SOUNDS, SOUND_IDS, SOUND_SAMPLE_RATE, render } from "@bow-szn/sound";
import type { SoundId } from "@bow-szn/sound";
```

`SoundId` is a union of string literals, so `play("twang")` type-checks and `play("twnag")` does not. `SOUNDS` is a `Record<SoundId, Sound>`, so adding an id without defining it is a type error too.

The main entry has no Node API, so `render(sound, sampleRate)` also runs in the app. It returns a mono `Float32Array` and the same samples every time. `@bow-szn/sound/wav` holds `encodeWav(samples, sampleRate)`, which needs Node's `Buffer` and writes 16-bit PCM.

The app plays the generated files in `apps/mobile/assets/sound/<id>.wav`, 22050 Hz mono, about 1.2 MB in all.

## Sounds

| id             | kind   | when it plays                                           |
| -------------- | ------ | ------------------------------------------------------- |
| `creak`        | sfx    | the bow limb while drawing, retriggered as power rises  |
| `full-draw`    | sfx    | a tiny tick when full draw is reached                   |
| `twang`        | sfx    | the string releasing                                    |
| `whoosh`       | sfx    | the arrow in flight, about 400 ms                       |
| `thunk`        | sfx    | the arrow hitting dirt on a miss                        |
| `hit`          | sfx    | a meaty arrow hit                                       |
| `spook`        | sfx    | animals bolting, a hoof-patter burst                    |
| `glint`        | sfx    | the sparkle when a buck's rack glints                   |
| `whiff`        | sfx    | the comedic miss sting                                  |
| `tap-hit`      | sfx    | prep minigame success                                   |
| `tap-slip`     | sfx    | prep minigame slip                                      |
| `ui-select`    | sfx    | a menu button press                                     |
| `fanfare`      | jingle | harvesting a buck, 2 to 3 seconds                       |
| `jingle-title` | jingle | the title loop, 12 bars, built to repeat without a seam |

## Data model

`src/types.ts` holds the shapes.

- A `Voice` is a `Waveform` (`square` at 12.5, 25, or 50 percent duty, `triangle`, `saw`, or `noise`), an ADSR `Envelope`, a `Pitch` sweep from `startHz` to `endHz` along a `linear` or `exponential` curve, an optional `Vibrato`, a `volume`, and a `holdSec` for how long the envelope stays gated before the release.
- A noise voice reads its pitch as the clock rate of a 15-bit shift register, so a higher pitch is a finer grain. `hiss` mode runs 32767 steps before it repeats. `buzz` mode runs 93 and rings with a pitch. The `seed` makes the noise repeat exactly.
- A `Sfx` is a list of voices, each with an `atSec` offset.
- A `Jingle` is a `bpm`, `beatsPerBar`, and channels. A `melodic` channel pairs a `Timbre` (a voice without pitch and hold) with a notation string. A `percussion` channel pairs a kit of one voice per `Drum` with a notation string.

Each jingle note or drum hit renders inside its own window. The release is squeezed to fit, so a channel is monophonic, a repeated note re-attacks from silence, and nothing rings past the last bar. A jingle lasts exactly its bars, and every channel must agree on the bar count.

## Note notation

A track is a string of whitespace-separated tokens.

| token       | meaning                                                                       |
| ----------- | ----------------------------------------------------------------------------- |
| `c5`, `f#4` | a note: letter, optional `#` or `b`, then a one-digit octave (`a4` is 440 Hz) |
| `r`         | a rest                                                                        |
| `k s h x`   | kick, snare, hat, and crash, in percussion tracks only                        |
| `:8`        | a length after any token: 1, 2, 4, 8, 16, or 32 as the note value             |
| `:4.`       | a trailing dot lengthens the note by half                                     |
| `\|`        | closes a bar                                                                  |

A token with no length repeats the length of the token before it, and the first token defaults to a quarter note. A beat is a quarter note. Every bar must add up to `beatsPerBar` and end with `|`, and the parser names the bar that does not.

```text
a4:4 c5:8 e5 a5:2 |
```

At 120 bpm that is A4 for half a second, C5 and E5 for a quarter second each, and A5 for a second.

## Regenerate the files

```bash
node packages/sound/scripts/generate-sound.ts
```

From `packages/sound`, `npm run sound` does the same. The script writes one WAV per id and prints a markdown table of id, duration, peak, and file size. It rewrites identical bytes when nothing changed.

## Tests

- Unit tests cover the WAV encoder, the notation parser, the envelope, the oscillators, the voice renderer, and the renderer. The registry suite checks every sound: no NaN, a peak between 0.3 and 0.98, near-zero first and last samples, and the same samples on every render. It also checks the whoosh length, the fanfare length, and that the title loop is a whole number of bars.
- Snapshot tests record a fingerprint of each rendered sound, so a change to the audio shows up as a reviewed diff. They also compare each committed WAV with a fresh render, so a changed sound fails until the files are regenerated.

`npm run vibecheck` runs lint, typecheck, and every tier.

## Change or add a sound

1. Add the id to `SOUND_IDS` in `src/sounds/ids.ts` and write the sound in `src/sounds/`.
2. Register it in `src/registry.ts`. Until you do, the `Record<SoundId, Sound>` fails to type-check.
3. Run `npm run sound` to rewrite the WAV files.
4. Run `npx jest --selectProjects snapshot -u` to record the new fingerprint, and read the snapshot diff before you commit.

Give every voice an attack of at least 1 ms and let it release before the sound ends. The registry suite fails a sound that starts or ends above 0.01 amplitude, because that is an audible click.
