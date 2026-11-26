# Pattern Data Model — BEATBLOCK

## Goals
- Store patterns locally and serialize them safely.
- Support mixed sample/synth channels.
- Version the file format.
- Keep the active working session distinct from named saved patterns.

## Suggested JSON shape
```json
{
  "format": "beatblock-pattern",
  "schemaVersion": 1,
  "id": "pattern_...",
  "name": "My Groove",
  "createdAt": "ISO-8601 timestamp",
  "updatedAt": "ISO-8601 timestamp",
  "tempo": 100,
  "swing": 0,
  "masterVolume": 0.8,
  "kitId": "classic-808",
  "steps": 16,
  "channels": [
    {
      "id": "kick",
      "name": "Kick",
      "muted": false,
      "voice": {
        "type": "synth",
        "presetId": "synth-kick-01",
        "parameters": { "pitch": 0.5, "decay": 0.45 }
      },
      "volume": 0.8,
      "pitch": 0,
      "activeSteps": [0, 4, 8, 12]
    }
  ]
}
```

This is an illustrative schema, not a final validator. Define exact parameter ranges and required fields in code before import/export ships.

## Persistence categories
- `working-session`: autosaved current state, including unsaved edits.
- `named-patterns`: explicit user-created saves.
- `preferences`: theme, intro seen, default tempo, accessibility and UI settings.
- `asset-cache`: optional cached/decode metadata; never treat it as user-authored pattern data.

## Storage approach
- Use a small storage adapter interface so localStorage or IndexedDB can be changed without rewriting UI.
- IndexedDB is recommended for patterns and larger data; localStorage is acceptable for small preferences/intro flag.
- Do not store raw audio blobs in localStorage.
- Handle quota errors, malformed data, migration, and unavailable storage.

## Import validation
- Validate format string and schema version.
- Bound numeric fields (tempo, swing, gain, pitch, envelopes).
- Restrict channel IDs and voice types to known implementations.
- Reject unknown or invalid sound references or map them to a documented safe fallback.
- Enforce a maximum file size.
- Never execute imported content.
- Validate before mutating current state.
- Preserve current state if import fails.

## Save semantics
- Autosave is debounced and resilient, but should not be delayed so long that a quick refresh loses recent work.
- Named Save creates or updates the selected named pattern only after clear user intent.
- Save As always creates a new ID.
- Delete asks for confirmation.
- Export includes format and schema version.
- Future schema changes use explicit migrations.
