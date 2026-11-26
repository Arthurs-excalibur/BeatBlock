# Design System — BEATBLOCK

## 1. Design intent
A warm, tactile, hardware-inspired drum machine. Surfaces appear molded from matte ivory material, with raised controls, inset wells, precise labels, and signal-orange active states.

## 2. Visual principles
- **One material:** most interface surfaces share a warm neutral base.
- **Depth with purpose:** raised = interactive/available; inset = wells, tracks, inactive pads. Do not use shadows as the only state indicator.
- **Orange means active or important:** playhead, selected step, active toggle, primary action.
- **Compact instrument density:** align controls in repeated channel strips; avoid decorative whitespace that wastes instrument space.
- **Typography is functional:** short uppercase labels may resemble hardware markings, but use readable sizes and contrast.
- **Motion is physical, not ornamental:** quick press-in/out, subtle knob movement, sequencer pulse. Avoid constant distracting motion.

## 3. Color palette
- Ivory background: `#F5F0E8`
- Raised surface: `#F5F0E8`
- Recessed surface: `#E9E2D8`
- Warm shadow: `#CFC6B9`
- Highlight: `#FFFFFF`
- Signal orange: `#F07816`
- Dark ink: `#292722`
- Secondary text: `#756F66`
- Success: `#357A52`
- Warning: `#9A5B12`
- Error: `#B33A32`

Validate all text and state combinations for contrast in the actual implementation. Neumorphic shadows are supplementary, not a substitute for borders or clear focus indicators.

## 4. Typography
Suggested family: Manrope, Inter, or another well-supported sans-serif.
- Display/wordmark: bold, distinctive, compact.
- Main headings: semibold.
- Hardware labels: uppercase, compact, but never below tested legibility limits.
- Numeric BPM/time values: tabular numerals where supported.
- Avoid ultra-light text on low-contrast backgrounds.

## 5. Shape and depth
- Control surfaces: circular or softly rounded.
- Panel radius: medium to large, consistent.
- Raised surfaces use paired light and dark shadows.
- Inset surfaces reverse the depth cues.
- Pressed state reduces/changes shadow depth and uses a visible state change.
- Use a border or outline for focus, selection, and disabled states.

## 6. Component states
### Rotary control
- Rest: raised dial with a visible indicator mark.
- Hover: subtle elevation/contrast change (desktop only).
- Active: indicator rotates with value.
- Focus: high-contrast outline.
- Disabled: muted and noninteractive, with explanatory label where necessary.
- Value: show a number or tooltip while adjusting; support keyboard adjustments.

### Sequencer pad
- Off: recessed pad.
- On: clear orange or orange-accented fill plus shape/contrast change.
- Current step: separate playhead marker, distinguishable from on/off state.
- Focus: visible outline.
- Muted channel: visually muted but still identifiable.
- Trigger/preview: brief active animation; must not obscure the persistent step state.

### Button
- Primary: orange emphasis, clear text.
- Secondary: raised neutral.
- Destructive: clearly labeled, confirm when consequential.
- Press: subtle inset transition.
- Loading/disabled: explicit state.

## 7. Motion
- Typical UI transitions: 120–220 ms.
- Knob movement should follow pointer/touch smoothly.
- Pad press animation should be brief and should not drive audio timing.
- Respect reduced-motion preferences.
- No scroll-jacking or mandatory animated intro that blocks entry.

## 8. Layout
- Desktop: instrument board is the dominant element, not a dashboard of cards.
- Mobile landscape: preserve channel/step relationships, compress secondary information.
- Settings workspace: left navigation + content area on wider screens; responsive stacked navigation if needed.
- Use consistent spacing and align repeated channel strips precisely.
