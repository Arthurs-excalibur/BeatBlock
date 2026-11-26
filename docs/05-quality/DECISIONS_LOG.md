# Decisions Log — BEATBLOCK

| ID | Decision | Status | Rationale |
|---|---|---|---|
| D-001 | Warm ivory and signal-orange neumorphism | Locked | Establishes recognizable tactile hardware identity. |
| D-002 | First-visit landing only | Locked | Provides introduction without slowing returning users. |
| D-003 | Main studio is the core product, not a marketing dashboard | Locked | Instrument-first experience. |
| D-004 | Eight drum channels and 16 steps | Locked | Defines the initial instrument scale. |
| D-005 | Settings and customization share one full-screen workspace | Locked | Keeps navigation simple while separating functions into sections. |
| D-006 | Manual named saves plus autosave | Locked | Combines deliberate versioning with recovery. |
| D-007 | Samples and synthesis | Locked | Enables both realistic and experimental sounds. |
| D-008 | Four starter pack concepts | Proposed/locked as direction | Classic 808, Lo-fi Dust, Studio Acoustic, Future Percussion; assets still need sourcing/creation and licensing. |
| D-009 | Desktop full board, mobile landscape compact board | Locked | Preserves instrument relationships and reduces scrolling. |
| D-010 | Portrait orientation prompt when board cannot fit usefully | Locked with fallback caveat | Do not force unsupported orientation locks or shrink controls indefinitely. |
| D-011 | One shared audio engine and state across layouts | Locked | Prevents divergent behavior and lost sessions. |
| D-012 | No accounts/cloud sync in MVP | Recommended | Keeps scope small and offline/local-first. |

## Open implementation decisions
- Framework and package manager: inspect repository before choosing.
- Storage implementation: IndexedDB recommended for pattern library; localStorage may hold small preferences.
- Starter pattern on first launch: recommended, but confirm during implementation.
- Exact audio parameter ranges and swing algorithm: define and test before implementation.
- Minimum usable viewport dimensions: establish through prototypes and device testing.
- Audio sample source and license: document for every bundled asset.
