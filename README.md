# BeatBlock

A tactile, neumorphic 8-channel × 16-step drum machine in the browser built with React, TypeScript, and the Web Audio API.

## Features

- **8 × 16 Step Sequencer** — Real-time Web Audio scheduling with tempo, swing, per-channel volume, mute/solo, and kit selection.
- **Hybrid Sound Engine** — Combines bundled WAV drum samples with synthesized Web Audio voices.
- **Pattern Persistence** — Local autosave with session recovery plus manual named pattern saves.
- **Responsive Studio** — Full desktop board, compact mobile landscape layout, and portrait orientation prompt.
- **Landing Showcase** — Product launch hero with direct entry into the studio.

## Tech Stack

- **UI:** React 19, TypeScript, Vite 6, Lucide React
- **Audio:** Web Audio API
- **Testing:** Vitest, Testing Library, jsdom

## Getting Started

```bash
npm install
npm run dev
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check with `tsc` and build for production |
| `npm test` | Run the Vitest test suite |
| `npm run preview` | Preview the production build locally |

## Documentation

Product, design, and engine specifications live in [`docs/`](./docs).
