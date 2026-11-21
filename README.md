# Christmas Wonderland — Final Edition

A cinematic Christmas destination built around a burgundy / oxblood visual identity, interactive winter-village exploration and small festive experiences.

## Product experience

- **Homepage (`/`)** — full-screen cinematic hero, navigation, stories, destinations, gallery, card studio entry point and countdown.
- **Christmas World (`/world`)** — six interactive destinations, location detail panel and a visit checklist retained for the current browser tab session.
- **Experiences (`/experiences`)** — Little Surprise, Christmas Memory Match and Wish Jar. Wishes remain in the current tab session and are not uploaded.
- **Christmas Card Studio** — edit recipient, sender, greeting, palette and ornament; preview, copy text and export a PNG locally in the browser.
- **Gallery lightbox** — open, browse with previous/next controls or arrow keys, and close with Escape.

## Motion and polish (Phases 4–5)

- Progressive reveal animations as sections enter the viewport.
- Slow cinematic hero drift, multi-layer snowfall and subtle pointer light on fine-pointer devices.
- Reading progress indicator.
- Optional original soft bell tones, started only after the visitor explicitly turns sound on. No audio autoplays.
- `prefers-reduced-motion` support; content remains visible and usable when motion is reduced.
- Loading, not-found and route error screens.
- SEO metadata, Open Graph cards, sitemap, robots rules, manifest and custom SVG icon.
- Baseline browser security headers and `X-Powered-By` disabled.
- Stable navigation markup: links are static on the server and client; active route styling is applied only after hydration.

## Requirements

- Node.js 20.9 or newer (Node.js 22 recommended)
- npm

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production verification

```bash
npm run build
npm run start
```

Before deploying, verify `/`, `/world`, `/experiences`, the Card Studio export, Wish Jar session restore, Memory Match replay, mobile menu and the sound toggle.

## Data and privacy

This release does not require Supabase, an API key or environment variables. The map visit list and Wish Jar use `sessionStorage` only; content is not sent to a server. Greeting-card PNGs are rendered locally with Canvas. Audio is generated locally with the Web Audio API after an explicit user action.

## Hydration mismatch recovery

The header now renders the same static `href` values on the server and the first client render. `usePathname()` controls only the active visual state after the component mounts. If Next.js still shows a stale hydration overlay after replacing files, stop the dev server, remove the `.next` cache and restart:

PowerShell:

```powershell
# Stop npm run dev first
Remove-Item -Recurse -Force .next
npm run dev
```

Do not delete `node_modules`, `package.json` or your project files to clear this error.
