# A Little Christmas World

A public-facing, magical and interactive Christmas landing page built with Next.js App Router, React, TypeScript and CSS.

## Included in this first version

- Responsive one-page Christmas experience
- Full-screen, layered canvas snowfall and illustrated CSS Christmas tree
- Live countdown to the next December 25
- Interactive Christmas letter modal
- Randomizable Christmas wish cards
- Open/close surprise gift interaction
- Illustrated Christmas moodboard gallery
- Small hidden-star gift game
- Optional original synthesized winter chimes (no external music file required)
- Full-viewport snowfall with varied flake sizes, depth, drifting wind and reduced-motion support
- Basic keyboard accessibility

## Run locally

Requirements: Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production build

```bash
npm run build
npm run start
```

## Design notes

The first version uses CSS illustrations and does not depend on external stock images. Google Fonts are loaded through CSS when an internet connection is available; system serif/sans-serif fallbacks are provided.

The sound control plays a short, original synthesized winter-chime motif through the Web Audio API after the visitor opts in. It does not autoplay and does not use a copyrighted recording.
