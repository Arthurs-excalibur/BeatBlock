# Audio Engine Specification — BEATBLOCK

## 1. Responsibilities
- Initialize browser audio after a user gesture when required.
- Play sample voices and synthesized voices through a common channel interface.
- Schedule a 16-step loop across eight channels.
- Apply tempo, swing, channel mute, per-channel gain/pitch, and master gain.
- Provide preview playback for kit sounds.
- Keep UI animation separate from audio scheduling.

## 2. Recommended browser primitives
Use the Web Audio API. A dedicated audio engine module should own `AudioContext`, scheduling, sample buffers, oscillator/noise voices, gain nodes, filters, and lifecycle cleanup. Keep framework components out of timing-critical code.

## 3. Scheduling
- Schedule ahead using the audio clock (`AudioContext.currentTime`) and a short look-ahead scheduler.
- Do not use `setInterval` or `requestAnimationFrame` as the direct source of sound timing; a timer may wake the scheduler, but events must be scheduled against the audio clock.
- Each event is identified by pattern step, channel, and scheduled audio time.
- Define deterministic behavior for tempo change during playback.
- Stop must cancel future scheduling and silence/stop active voices where appropriate.
- UI playhead updates are derived from scheduled step timing and must not drive audio output.
- Swing should delay eligible off-beat steps within a documented bounded range. Avoid accumulating timing drift.

## 4. Voice types
### Sample voice
- Loads a licensed local asset into an AudioBuffer.
- Supports playback rate/pitch and gain where feasible.
- Handle decode failure and missing assets.
### Synth voice
- Use oscillators, envelopes, noise, filters, and gain nodes to synthesize kick, snare-like noise, hats, toms, and experimental percussion.
- Provide a stable parameter schema so presets can be saved.
### Common voice contract
- `trigger(time, velocity?, parameters?)`
- `preview(parameters?)`
- `dispose()`
Implementation details may differ, but sample and synth voices should be interchangeable at the channel-assignment layer.

## 5. Starter kit manifest
- `classic-808`: synthesized kick/snare/hat/tom voices; original design, not a copy of protected sample assets.
- `lofi-dust`: original CC0 procedural sample kick/snare/hat assets plus synthesized hand percussion.
- `studio-acoustic`: original CC0 procedural acoustic-inspired kick/snare/hat assets plus synthesized hand percussion; these are not field or studio recordings.
- `future-percussion`: synthesized experimental voices.
- Sample clip manifests include ID, display name, channel ID, asset path, CC0 license metadata, default pitch/volume, and preview availability.
Each sound manifest should include ID, display name, type, asset path if sampled, license metadata, default parameters, and preview availability. Do not imply official endorsement by a hardware manufacturer.

## 6. Audio UX
- Show whether audio is ready/blocked.
- A first user action may initialize audio, but never silently fail.
- Provide mute and master volume.
- Previewing a kit should not unexpectedly change the active pattern.
- Avoid clipping where practical; use conservative gain staging and consider a master limiter only if implemented and tested.
- Handle tab visibility changes deliberately. Avoid surprising continued playback if product policy chooses to pause in background.

## 7. Performance and licensing
- Keep bundled sample assets small and appropriately encoded.
- Lazy-load packs if appropriate.
- Include attribution and license files for non-original sounds.
- Do not use sample pack names/assets in a way that implies official endorsement by a hardware manufacturer.
