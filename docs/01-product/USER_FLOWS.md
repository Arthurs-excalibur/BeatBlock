# User Flows — BEATBLOCK

## 1. First visit
1. User opens BEATBLOCK.
2. Landing page introduces the instrument.
3. User selects **Open the Studio**.
4. Studio loads with a safe default kit and starter pattern or a clearly empty pattern (choose one during implementation; recommended: a short starter pattern that can be cleared).
5. If audio is not initialized, first playback gesture initializes audio and starts playback or displays a clear Enable Audio action.
6. User toggles steps and hears the loop.

## 2. Returning visit
1. Read the local intro-seen flag.
2. If seen, open the studio directly.
3. Restore autosaved working session when available.
4. Show a subtle “Recovered last session” confirmation that can be dismissed.
5. If local storage is unavailable, continue in memory and warn that changes may not persist.

## 3. Change sound kit
1. Open Settings & Customization.
2. Select Sound Kits.
3. Preview a kit without unexpectedly replacing the current kit.
4. Choose Load Kit.
5. If the current pattern uses channel-specific overrides, define and communicate whether loading a kit replaces or preserves those overrides.
6. Return to the studio; current step pattern remains unless the user confirms replacement.

## 4. Edit a channel
1. Open Channels.
2. Select a channel.
3. Choose a sample or synth voice.
4. Adjust supported parameters.
5. Preview the sound.
6. Apply changes and return to the studio.

## 5. Save a pattern
1. Select Save.
2. Enter a name; validate empty/duplicate names with clear feedback.
3. Save as a named pattern.
4. Confirm success.
5. Autosave continues to track later edits independently.

## 6. Save As / duplicate
1. Choose Save As or Duplicate.
2. Provide a new name.
3. Create a new pattern ID; never overwrite the source pattern silently.
4. Load the copy or remain on the current pattern according to a consistent product rule.

## 7. Import/export
1. Export produces a versioned JSON file.
2. Import validates schema version, bounds, channel IDs, sound references, and values before changing current state.
3. Show a preview/summary before replacing the current working session.
4. Reject invalid files safely and preserve current work.
5. Imported patterns must not reference arbitrary remote scripts or executable content.

## 8. Portrait mobile
1. Detect viewport constraints, not just user-agent/device type.
2. If the instrument is too narrow/short to be usable, display a branded orientation prompt.
3. When landscape viewport becomes usable, render the compact studio without reloading or resetting audio/pattern state.
4. If rotation is not possible, offer a fallback message and explain supported minimum dimensions.
