# Responsive Specification — BEATBLOCK

## Goal
Keep the active instrument visually whole and immediately usable. The main studio should not become a long vertically scrolling page.

## Layout modes
### Wide desktop
- Full-width instrument board.
- Eight channel strips visible together.
- 16-step sequencer visible at the same time as transport/master controls.
- Channel strips may use more detailed labels and waveforms.
- Use CSS grid/flex constraints and measured board geometry, not screenshot-specific absolute positioning.

### Compact landscape
- Same eight channels and sixteen steps.
- Shorten labels and waveform display; retain meaningful controls.
- Group secondary controls into a compact master/effects cluster.
- Use `100dvh` with safe-area insets; account for browser chrome.
- Do not let page-level overflow scroll vertically.
- Test narrow landscape widths and low landscape heights independently.

### Portrait constraint view
- When the board cannot meet minimum usability constraints, display a branded orientation prompt.
- The prompt must not falsely claim that the site can force rotation.
- Detect actual viewport dimensions/orientation; do not rely only on user-agent sniffing.
- Include concise instructions and a subtle animation; respect reduced motion.
- If the user cannot rotate, offer a clear message about supported viewport requirements or a simplified fallback if product design approves one.

## Minimum usability policy
Do not continually scale down the full board to fit. Establish minimum sizes for pad hit areas, text, and controls. If the viewport is below those limits, switch to compact presentation or orientation prompt.

## Interaction
- No horizontal page overflow in any supported mode.
- No vertical page scroll while the instrument board is active at supported dimensions.
- Sequencer cells remain independently tappable.
- Controls support pointer, touch, and keyboard.
- Layout change does not reset playback, active pattern, mute state, or control values.
- Settings workspace may scroll independently; the no-scroll rule applies to the active instrument, not every screen.

## Test matrix
Test at least:
- Desktop: 1280×720, 1440×900, 1920×1080.
- Small laptop: 1024×600.
- Tablet landscape: 1024×768 and a smaller landscape viewport.
- Phone landscape: 844×390, 932×430, and one short-height viewport.
- Phone portrait: 390×844 and 430×932.
- Browser zoom and safe-area emulation where possible.

Record any viewport where the compact instrument cannot maintain usable hit areas. Do not mark the design complete based only on a screenshot.
