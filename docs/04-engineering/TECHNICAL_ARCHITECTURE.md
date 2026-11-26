# Technical Architecture — BEATBLOCK

## Architecture principles
- Separate UI, instrument state, audio engine, persistence, and sound assets.
- One shared state/audio engine for all responsive presentations.
- Keep timing-critical audio logic outside view components.
- Use typed contracts and validate all imported data.
- Avoid premature backend infrastructure.

## Suggested modules
```text
src/
  app/
    App
    routes-or-view-state
  components/
    common/
    neumorphic/
    instrument/
      DrumChannel
      RotaryControl
      SequencerGrid
      SequencerPad
      TransportBar
      MasterControls
    settings/
      SettingsWorkspace
      SoundKitLibrary
      ChannelEditor
      PatternLibrary
      AppearanceSettings
      GeneralSettings
  features/
    landing/
    studio/
    settings/
    patterns/
  engine/
    AudioEngine
    Scheduler
    voices/
      SampleVoice
      SynthVoice
    kits/
      manifest
  state/
    instrumentStore
    preferencesStore
  persistence/
    storageAdapter
    workingSessionRepository
    patternRepository
    migrations
  types/
    pattern
    kit
    voice
  styles/
    tokens.css
    themes.css
  assets/
    samples/
```

This is a conceptual layout; adapt it to the chosen framework and repository conventions.

## State ownership
- Instrument state: active pattern, channel steps, mute states, voice assignments, BPM, swing, volume, playback state.
- Preferences: theme, intro seen, reduced motion, defaults, keyboard settings.
- Audio engine: context, scheduled events, decoded samples, active nodes.
- Persistence: serializes validated snapshots; it should not own UI rendering.
- Responsive mode: derived from viewport constraints; must not duplicate instrument state.

## Suggested implementation technologies
Choose only after inspecting the project:
- TypeScript for contracts and state.
- Web Audio API for sound.
- CSS variables driven by `DESIGN_TOKENS.json`.
- React/Vite or the repository's existing framework if already selected.
- IndexedDB for patterns/session if data size warrants it.
- Automated unit tests for pattern validation, scheduler math, persistence, and responsive state behavior.

## Failure boundaries
- Audio engine unavailable: show a clear enable/retry state; rest of UI should remain usable.
- Sample missing: fallback to a documented synthesized voice or show an unavailable state.
- Storage unavailable/full: continue in memory and warn that persistence is not guaranteed.
- Invalid import: reject without mutating current pattern.
- Unsupported viewport: show orientation prompt or approved fallback.
