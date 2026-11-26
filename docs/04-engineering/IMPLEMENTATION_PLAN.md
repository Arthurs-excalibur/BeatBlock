# Implementation Plan — BEATBLOCK

Build incrementally. Do not attempt the entire product in one giant code-generation pass.

## Phase 0 — Repository and design foundation
- Inspect existing repository, scripts, framework, and dependencies.
- Create tokens and global theme variables.
- Establish responsive viewport shell and component conventions.
- Confirm keyboard and reduced-motion behavior.
**Exit:** app runs, lint/typecheck/build pass, tokens are used by real components.

## Phase 1 — Static instrument shell
- Build landing page and first-visit routing.
- Build desktop board layout and compact landscape layout.
- Build portrait orientation prompt.
- Add channel strip, knobs, sequencer cells, transport/master sections as visual components.
**Exit:** all required board regions visible at target viewports; no page scroll/overflow in studio.

## Phase 2 — Instrument state and sequencer
- Add 8 channels × 16 steps.
- Implement toggles, current-step visualization, mute, tempo, swing state.
- Add keyboard accessibility and touch behavior.
**Exit:** state changes correctly and survives responsive layout changes.

## Phase 3 — Audio engine
- Add Web Audio initialization and scheduler.
- Implement synthesized voices first for deterministic smoke testing.
- Add sample voice abstraction and licensed starter assets.
- Implement kit loading, preview, mute, volume, pitch, attack/release where supported.
**Exit:** loops run in time; changing views does not interrupt or reset playback.

## Phase 4 — Persistence
- Add working-session autosave and recovery.
- Add named save, Save As, rename, duplicate, delete.
- Add versioned JSON import/export and validation.
**Exit:** refresh/reopen restores work; malformed imports do not destroy current state.

## Phase 5 — Settings & customization
- Build full-screen workspace and five internal sections.
- Implement sound kit library, channel editor, pattern library, appearance, general settings.
- Return to studio without losing session.
**Exit:** every enabled control works and has loading/success/error states where appropriate.

## Phase 6 — Polish and QA
- Add micro-interactions, waveform previews, empty/loading/error states.
- Test keyboard, touch, reduced motion, contrast, browser storage failures.
- Test target viewport matrix and real phone/tablet.
- Profile playback under UI load.
**Exit:** all acceptance criteria pass and no critical defects remain.

## Phase 7 — Mixed sample kit completion
- Complete the sample-voice work deferred from Phase 3 with documented original starter assets.
- Implement buffered sample loading, per-channel pitch/gain, cache, kit preview, and synthesized fallback for missing/undecodable clips.
- Make Lo-Fi Dust and Studio Acoustic use sample kick/snare/hat voices alongside synthesized hand percussion; keep Classic 808 and Future Perc fully synthesized.
- Keep kit voice assignments accurate in channel UI and pattern import/export.
**Exit:** sample and synth voices both trigger from one kit/pattern; samples decode and preview; failed assets fall back without stopping the sequencer; complete tests and production build pass.

## Working rule
At the end of each phase, run the project's existing tests, lint/typecheck/build, and targeted manual checks. Do not silence errors or use broad TypeScript suppressions merely to claim success.
