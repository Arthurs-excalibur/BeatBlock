# Phase 7 — Mixed Sample Voice Completion

Phase 7 closes the sample-voice scope listed in Phase 3 of the implementation plan. It adds original, self-contained sample assets without depending on external sample packs or runtime CDNs.

## Voice assignment

- `classic-808` and `future-perc` continue to use the existing synthesizer voices.
- `lofi-dust` uses sampled kick, snare, closed hat, and open hat; clap, tom, rim, and percussion remain synthesized.
- `studio-acoustic` uses its own sampled kick, snare, closed hat, and open hat; the remaining channels stay synthesized. “Acoustic-inspired” describes the generated timbre; these are not recordings.
- Channel voice types are derived from the selected kit so the studio labels and exported pattern voice declarations match the actual kit assignment.

## Asset format and provenance

Eight mono PCM WAVs (22.05 kHz, 16-bit) live under `public/samples/`. They are created deterministically by `scripts/generate_original_samples.py`; the generator uses mathematical oscillators and seeded noise, and does not read or copy external recordings. The audio files are dedicated under CC0 1.0; see `public/samples/LICENSE.txt`.

## Runtime behavior

`src/engine/sampleVoice.ts` owns the typed clip manifest, per-AudioContext decoded-buffer cache, and asynchronous loader. The AudioEngine awaits initial kit loading before scheduling its first step; while a kit changes during playback, the scheduler can continue and uses synth fallback until that kit's sample buffers are ready. Fetch/decode failures leave affected clips on the existing synth voice instead of breaking the transport. Sample triggers schedule a buffer source against the audio clock and apply channel gain and semitone playback-rate pitch. Preview and playback use the same channel dispatch.

## Verification

`src/engine/sampleVoice.test.ts` covers one-time loading, buffer scheduling, gain/pitch, sample/synth coexistence, CC0 manifest metadata, and fallback after load failure. Still use browser/device checks for audible playback and timing; unit tests and a production build do not replace listening tests.
