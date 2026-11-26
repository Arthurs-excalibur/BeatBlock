# BEATBLOCK — Skill Lock

## Project Identity

BEATBLOCK is a browser-based drum machine built around a tactile neumorphic interface, an 8-channel × 16-step sequencer, and an expressive audio experience.

**Design direction:** Warm ivory, signal orange, soft recessed surfaces, tactile controls, and instrument-first layouts.

**Product principle:** Make it work → make it groove → make it look good → expand it.

## 1. Skill Roles and Authority

Use the following skills together, with clearly separated responsibilities.

### Caveman — Simplicity and Efficiency
- Prefer straightforward solutions over unnecessary abstraction.
- Keep code, explanations, and implementation steps concise.
- Avoid overengineering and unnecessary dependencies.
- Preserve existing working code unless a change is justified.
- Never sacrifice correctness or accessibility merely to reduce code.

### Ponytail — Project Workflow and Execution
- Follow the installed skill's intended workflow and instructions.
- Coordinate implementation into small, verifiable steps.
- Inspect the existing project before planning or editing.
- Identify risks, dependencies, and affected features before making changes.
- Verify results and report what was actually completed.

### Frontend Design — Visual Quality
- Own the visual execution of the interface.
- Maintain BEATBLOCK's distinctive neumorphic instrument aesthetic.
- Use deliberate spacing, typography, contrast, hierarchy, and tactile states.
- Avoid generic dashboards, excessive cards, decorative clutter, and unnecessary whitespace.
- Make functional controls look and behave like real instrument controls.

### UI/UX Pro Max — Design-System Intelligence
- Use its design-system guidance to inform component patterns, color choices, typography, accessibility, and responsive behavior.
- Establish consistent reusable design tokens and component rules.
- Resolve design inconsistencies before expanding the interface.
- Treat recommendations as guidance, not permission to override BEATBLOCK's established design decisions.

## 2. Conflict Resolution

When instructions overlap or conflict, follow this order:

1. User's explicit request and project requirements.
2. Existing architecture, established project decisions, and documented specifications.
3. Correctness, security, accessibility, and reliable audio behavior.
4. UI/UX Pro Max for design-system consistency.
5. Frontend Design for visual execution.
6. Ponytail for workflow coordination.
7. Caveman for simplification and efficiency.

This is a priority order, not a reason to ignore the other skills. Use each skill for its intended responsibility.

Do not let two skills independently redesign the same component. Select one implementation direction, explain significant trade-offs, and proceed consistently.

## 3. BEATBLOCK Design Lock

The following decisions are fixed unless the user explicitly changes them:

- Warm ivory and neutral warm-gray surfaces.
- Signal orange for active steps, primary actions, and important playback states.
- Neumorphism used selectively to communicate tactile controls.
- Desktop-first full studio layout.
- Purpose-designed mobile landscape interface.
- Portrait orientation notice when the complete instrument cannot fit comfortably.
- Eight drum channels and sixteen steps per channel.
- One shared audio engine and application state across responsive layouts.
- First-visit introduction; returning users can enter the studio directly.
- Manual named saves plus autosave and recovery.
- Local-first MVP without authentication or cloud synchronization.

Do not silently replace these decisions with fashionable alternatives.

## 4. Engineering Lock

- Inspect the repository, existing project instructions, dependencies, and scripts before editing.
- Preserve the established framework and architecture unless a change is necessary and justified.
- Use the Web Audio API for browser audio functionality.
- Keep audio scheduling separate from UI rendering.
- Ensure tempo, swing, step timing, playback, stopping, and pattern changes behave predictably.
- Handle browser audio activation requirements correctly.
- Prevent duplicate playback loops, stuck sounds, and unnecessary audio-node leaks.
- Never present mocked playback or placeholder controls as completed functionality.
- Keep patterns, kit selection, and saved data consistent across UI layouts.
- Do not add authentication, backend services, or cloud synchronization to the MVP without approval.

## 5. Responsive Lock

Mobile support is a core feature, not a later polish task.

- Keep all sixteen steps accessible in landscape orientation.
- Prioritize the sequencer and transport controls on small screens.
- Move secondary controls into compact panels when necessary.
- Avoid arbitrary scaling that makes controls difficult to use.
- Prevent horizontal overflow and vertical scrolling in the active studio at supported viewport sizes.
- Show the portrait orientation notice when the usable instrument cannot fit.
- Detect the actual viewport; do not assume the browser can force device orientation.
- Test real viewport sizes rather than trusting responsive previews alone.

## 6. Execution Protocol

For every substantial task:

1. **Inspect** — Understand the current implementation and existing requirements.
2. **Plan** — Identify the smallest coherent change and its affected features.
3. **Implement** — Make focused changes without unrelated refactoring.
4. **Verify** — Run relevant tests, type checks, builds, and browser interaction checks.
5. **Report** — Summarize changed files, actual verification results, and remaining issues.

For visual work, inspect screenshots or browser output when available.

For audio work, verify actual sound and timing behavior, not just the presence of UI controls.

For bug fixes, reproduce the issue where possible and test for regressions.

## 7. Scope Protection

- Do not redesign the entire application when asked to fix one component.
- Do not introduce new libraries without a clear benefit.
- Do not invent features to make a screen look complete.
- Do not rewrite functioning code simply to match a skill's preferred style.
- Do not mark a task complete when verification has failed or has not been performed.
- Ask before making major architectural changes or changing locked product decisions.

## Definition of Done

A feature is complete only when:

- It meets the requested behavior.
- It matches BEATBLOCK's established design system.
- It works at its intended viewport sizes.
- It has no known critical regressions.
- Relevant checks have been run and their results reported.
- Any remaining limitations are clearly disclosed.

**Final rule:** Every skill contributes its specialty, but BEATBLOCK remains one coherent product. The result must work, sound right, feel good to use, and remain maintainable.