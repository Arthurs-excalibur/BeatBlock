# QA and Acceptance Checklist — BEATBLOCK

## Landing and navigation
- [ ] First visit shows landing page.
- [ ] Opening studio marks intro as seen.
- [ ] Returning visit opens studio directly.
- [ ] Intro can be replayed from Help/Settings.
- [ ] Missing/blocked storage does not crash startup.
- [ ] Back to Studio preserves the active session.

## Sequencer and audio
- [ ] Eight channels each have sixteen independently toggleable steps.
- [ ] Play/stop works repeatedly without duplicate schedulers.
- [ ] Current step indicator follows scheduled playback.
- [ ] BPM changes affect timing predictably.
- [ ] Swing changes groove without unbounded timing drift.
- [ ] Muted channels emit no sound.
- [ ] Sample and synth voices can coexist.
- [ ] Kit preview does not unexpectedly replace current kit.
- [ ] Audio initialization failure is communicated clearly.
- [ ] Playback remains stable while adjusting controls and changing workspace.

## Patterns and persistence
- [ ] Working session autosaves after meaningful edits.
- [ ] Refresh restores working session.
- [ ] Named save creates a pattern.
- [ ] Save As creates a new pattern ID.
- [ ] Rename, duplicate, load, and delete work as designed.
- [ ] Exported JSON can be imported again.
- [ ] Invalid or oversized imports are rejected safely.
- [ ] Failed import leaves current session untouched.
- [ ] Storage quota/error produces a warning and does not crash.

## Design and responsive behavior
- [ ] Warm ivory/orange neumorphic identity is consistent.
- [ ] Raised/inset styles communicate function without reducing legibility.
- [ ] Focus indicators are visible.
- [ ] No horizontal overflow.
- [ ] Desktop board shows all eight channels and all sixteen steps.
- [ ] Supported landscape board has no page-level vertical scroll.
- [ ] Portrait constraint screen appears when needed.
- [ ] Layout changes do not reset the pattern or audio state.
- [ ] Touch targets are usable on actual target devices.
- [ ] Reduced-motion preference is respected.
- [ ] Settings workspace remains usable at narrow widths.

## Quality gates
- [ ] No uncaught console errors in critical flows.
- [ ] Unit tests cover pattern validation, scheduler math, persistence, and migrations.
- [ ] Build/lint/typecheck pass according to repository setup.
- [ ] Audio asset licenses and attribution are included.
- [ ] Every enabled control works; unfinished controls are not presented as functional.
