# Product Requirements Document — BEATBLOCK

**Status:** Approved concept / ready for implementation planning  
**Product type:** Responsive browser-based drum machine  
**Working tagline:** *Make beats. Feel the rhythm.*

## 1. Product vision
BEATBLOCK is a playful, tactile browser instrument that feels like a compact physical drum machine. Its signature warm-ivory-and-orange neumorphic interface is not decoration around a generic app: the interface itself is the instrument. A user should be able to open the site, understand the controls, and make a loop within seconds.

## 2. Problem and opportunity
Many browser music tools are either visually generic or too complex for casual experimentation. BEATBLOCK aims to make beat creation approachable through a recognizable hardware-inspired layout, immediate sound feedback, and a focused set of controls.

## 3. Target users
- Curious first-time users who want to experiment without installing software.
- Hobbyist musicians and beat makers who want a quick sketchpad.
- Designers/developers evaluating a distinctive interactive portfolio project.

## 4. Product principles
1. **Instrument first:** the main studio is the product; avoid a conventional SaaS dashboard.
2. **Immediate feedback:** taps, knob changes, pattern edits, and playback produce clear feedback.
3. **Tactile but legible:** neumorphism must not reduce contrast, affordance, or focus visibility.
4. **No lost work:** autosave working state and provide explicit named saves.
5. **One engine, multiple layouts:** responsive views must not fork audio or pattern state.
6. **Progressive complexity:** basic beat-making is obvious; advanced sound shaping is discoverable.
7. **No fake functionality:** every visible control must work, or be visibly disabled and explained.

## 5. Information architecture
### A. First-visit landing
- Brand wordmark: BEATBLOCK.
- Tagline and short description.
- Animated preview or restrained live instrument vignette.
- Primary action: **Open the Studio**.
- Optional **Replay intro** action available later from Help/Settings.
- Store an intro-seen flag locally. If storage is unavailable, fail gracefully.
- Avoid pricing, account creation, testimonials, and fabricated claims.

### B. Main Studio
- Eight drum channels: Kick, Snare, Clap, Closed Hat, Open Hat, Tom, Rim, Percussion.
- Each channel: label, short waveform/voice indicator, sample/synthesis identity, and essential controls.
- 16-step sequencer with independently toggleable cells.
- Playback transport: Play/Stop; optional Clear/Undo only if implemented.
- Tempo (BPM), swing, master volume, current kit, current pattern, Save, and Settings entry.
- Current step is clearly indicated during playback.
- Main board should fit without vertical page scrolling at supported viewport sizes.

### C. Settings & Customization workspace
A dedicated full-screen workspace, with internal navigation:
1. **Sound Kits:** browse, preview, load built-in kits.
2. **Channels:** select channel, assign available sample or synth voice, adjust supported parameters.
3. **Patterns:** list, load, rename, duplicate, save, delete, import/export.
4. **Appearance:** light/dark theme and a restrained set of accent options; motion preference.
5. **Settings:** audio initialization/status, default BPM/swing, control sensitivity if supported, keyboard shortcuts, data management, reset preferences, help/about.
- Back to Studio returns to the existing session without resetting playback or state unless the user explicitly stops it.

## 6. Core functionality
### Playback and sequencing
- 8 channels × 16 steps.
- Play/stop reliably schedules steps at the selected BPM.
- Step timing must use an audio-clock-based scheduler, not animation-frame timing.
- Tempo changes take effect predictably without corrupting the active sequence.
- Swing alters timing of eligible alternating steps in a documented, bounded way.
- Muted channels do not emit sound.
- The UI playhead is a visual reflection of audio timing, not the source of timing.

### Sound generation
- Support both bundled samples and synthesized voices.
- Proposed starter packs:
  - **Classic 808:** primarily synthesized electronic drums, optional samples.
  - **Lo-fi Dust:** warm, textured sample-based kit with optional synth layers.
  - **Studio Acoustic:** sample-based natural drum sounds.
  - **Future Percussion:** primarily synthesized experimental percussion.
- These are proposed packs. Sample assets must be original, properly licensed, or public-domain/CC0 with licenses documented.
- Audio starts only after a user gesture where required by browser policy.
- Provide a clear audio-ready/enable-audio state if initialization is blocked.
- Keep sample sizes reasonable; load or decode only when needed where practical.

### Pattern persistence
- **Autosave:** maintain a recoverable working session locally.
- **Manual Save:** save a named pattern into the local pattern library.
- **Save As:** create a distinct copy.
- Import/export a versioned JSON format.
- Recovery after refresh/reopen should restore the last working session when possible.
- Clearly distinguish working autosave from named patterns.
- Confirm before destructive delete/reset operations.
- Handle storage quota or parse errors without crashing.

## 7. Responsive experience
### Desktop / wide viewport
- Full board with eight channel strips, full controls, master section, and all 16 sequencer steps visible.
- Preserve the provided hardware-inspired reference: channel strips above, transport/master controls below, sequencer across the lower area.

### Mobile landscape
- Compact instrument presentation.
- Keep all eight channels and all 16 steps visible if they remain usable.
- Reduce secondary labels and simplify the control surface, not the core instrument identity.
- Essential actions remain accessible.
- Respect safe areas and dynamic viewport height.
- No page-level vertical scrolling in the active instrument view.
- If a device is too short/narrow to support the minimum usable layout, show a designed orientation/viewport prompt or a compact fallback rather than shrinking indefinitely.

### Mobile portrait
- Show a dedicated, branded “Rotate your device” experience when the full instrument cannot fit usefully.
- Do not assume every device supports orientation locking. Detect viewport dimensions/orientation and adapt.
- Settings/help may use a conventional responsive layout if needed; the orientation requirement primarily applies to the active instrument.

### Responsive acceptance principle
Do not guarantee every control is simultaneously usable on every screen if the physical viewport makes that impossible. Prefer a legible fallback over tiny, inaccessible controls.

## 8. Accessibility and usability
- Keyboard-operable transport, steps, navigation, and key controls.
- Visible focus states that remain visible on raised/inset surfaces.
- Accessible names for icon-only controls.
- Do not communicate active/muted/error state by color alone.
- Respect `prefers-reduced-motion`.
- Support touch targets appropriate for the actual viewport; test real devices.
- Provide labels/tooltips for controls whose purpose is not obvious.
- Keep text contrast strong despite subtle shadows.
- Do not require hover to reveal essential actions.
- Announce meaningful save/error state accessibly.

## 9. Non-functional requirements
- Fast first render; defer nonessential sound assets.
- Stable playback under moderate UI load.
- No uncaught errors during normal workflows.
- No horizontal overflow.
- Persistent local data survives ordinary refresh/reopen.
- Clear recovery behavior for invalid/corrupt local data.
- Browser compatibility targets to be decided after the implementation stack is selected.

## 10. Out of scope for MVP
- User accounts and cloud sync.
- Multi-user collaboration.
- MIDI hardware integration.
- Audio recording/render-to-WAV export.
- User-uploaded sample files.
- Plugin formats or a full DAW timeline.
- Mobile portrait full-board mode at the expense of usability.

## 11. Success criteria
- A new user can start a beat without a tutorial.
- All 128 steps (8 × 16) can be toggled and played reliably.
- BPM and swing visibly and audibly affect playback.
- Sample and synthesized voices can coexist in a pattern.
- User can save, reload, duplicate, export, and import a pattern.
- Reload restores the latest autosaved working session.
- Desktop and mobile landscape share the same pattern/audio state.
- Studio has no page-level vertical scroll at approved target viewports.
- Every enabled control has a working behavior and an appropriate state.
