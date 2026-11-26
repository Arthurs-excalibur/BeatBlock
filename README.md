# BEATBLOCK — Project Documentation Pack

A documentation-first blueprint for building BEATBLOCK: a playable, neumorphic browser drum machine.

## Product decisions already locked
- Visual identity: warm ivory + signal orange, tactile neumorphic surfaces.
- Landing page: shown on first visit; returning visits go directly to the studio. Include a way to replay the intro.
- Main studio: full instrument, designed around eight drum channels and a 16-step sequencer.
- Settings and customization: one full-screen workspace, separated into internal sections.
- Saving: manual named saves plus autosave/recovery.
- Sound: both samples and synthesis, with bundled starter sound packs.
- Responsive behavior: desktop full board; mobile landscape compact board; portrait orientation prompt where the instrument cannot fit usefully.
- Shared engine/state: desktop and mobile are two presentations of the same instrument state.
- No account or cloud backend required for MVP.

## Suggested documentation order
1. `docs/01-product/PRD.md`
2. `docs/01-product/USER_FLOWS.md`
3. `docs/02-design/DESIGN_SYSTEM.md`
4. `docs/02-design/DESIGN_TOKENS.json`
5. `docs/02-design/RESPONSIVE_SPEC.md`
6. `docs/03-engine/AUDIO_ENGINE_SPEC.md`
7. `docs/03-engine/PATTERN_DATA_MODEL.md`
8. `docs/04-engineering/TECHNICAL_ARCHITECTURE.md`
9. `docs/04-engineering/IMPLEMENTATION_PLAN.md`
10. `docs/05-quality/QA_ACCEPTANCE.md`

## Important implementation note
These files define product behavior and intended architecture, not an existing codebase. Treat specific libraries as recommendations until the repository and current toolchain are inspected. Do not claim a feature is implemented merely because it is specified here.

## MVP boundary
Build a reliable, fun single-user instrument before adding cloud accounts, collaboration, MIDI device support, recording/export of rendered audio, or user-uploaded samples.
