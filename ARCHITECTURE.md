# Christmas Wonderland — Architecture

## Routes

- `/` — homepage and main entry point.
- `/world` — interactive winter village map and place details.
- `/experiences` — surprise picker, memory game and Wish Jar.
- Metadata routes: `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/icon.svg`.

## Main components

- `SiteHeader` — shared navigation, hydration-safe active state, card entry action and user-controlled sound toggle.
- `MotionDirector` — progressive reveal, pointer-light enhancement and scroll progress; all enhancements respect reduced-motion preference.
- `WonderlandHome` — cinematic homepage and gallery entry points.
- `GalleryLightbox` — accessible image viewer with keyboard navigation.
- `WorldExplorer` — six destinations, query-based initial selection and session visit progress.
- `ExperiencesPage` — surprise activity, memory matching and locally retained wishes.
- `GreetingStudioModal` — client-side greeting editor and PNG export.
- `Countdown` — updates only after mount so server markup is deterministic.

## Hydration strategy

- Navigation `href` values are static and identical during SSR and first client render.
- `usePathname()` is gated by a `mounted` state for visual active styling only.
- Countdown values begin as placeholders and are computed in `useEffect`.
- URL query selection and `sessionStorage` restore are performed after mount.
- Date/random-dependent logic is run only after user interaction or in effects, never while generating initial markup.

## Data

No backend is needed for the current release. World visits and Wish Jar entries are kept in `sessionStorage` for the current tab session. Card exports are generated locally using Canvas. The ambience toggle synthesizes soft bell tones locally via Web Audio and never autoplays.

## Motion/performance

- CSS animations are progressively enabled after hydration and viewport observation.
- `IntersectionObserver` is used for reveal-on-scroll; unsupported browsers keep content visible.
- Pointer glow only runs on fine-pointer devices.
- All non-essential motion is disabled or minimized for `prefers-reduced-motion`.
- Public assets use WebP where available.

## Security and delivery

- No secrets or environment variables are required.
- Next.js baseline response headers are configured in `next.config.mjs`.
- SEO metadata, canonical URLs, Open Graph/Twitter metadata, robots and sitemap are included.
