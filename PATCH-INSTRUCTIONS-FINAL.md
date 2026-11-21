# Final update — apply to an existing Christmas Wonderland project

This patch fixes the reported hydration mismatch and completes the remaining motion-design and quality/polish work (Phases 4–5).

## Files included

- `app/globals.css`
- `app/layout.js`
- `app/error.js`
- `app/loading.js`
- `app/manifest.js`
- `app/not-found.js`
- `app/robots.js`
- `app/sitemap.js`
- `app/icon.svg`
- `app/world/page.js`
- `app/experiences/page.js`
- `components/wonderland/SiteHeader.js`
- `components/wonderland/MotionDirector.js` (new)
- `components/wonderland/GalleryLightbox.js` (new)
- `components/wonderland/WonderlandHome.js`
- `components/wonderland/WorldExplorer.js`
- `components/wonderland/ExperiencesPage.js`
- `next.config.mjs`
- Documentation files

## Apply

1. Stop the local development server with `Ctrl + C`.
2. Make a copy or Git commit of your current project.
3. Extract this ZIP into the existing project root and allow the listed files to be replaced.
4. Do not replace `package.json`, `.env.local`, `.gitignore`, or your existing `public` directory. The patch does not add npm dependencies or environment variables.
5. Clear the stale Next.js build cache and restart.

PowerShell:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

6. Check `/`, `/world` and `/experiences`.
7. Run the production check before deploying:

```powershell
npm run build
```

8. When the local checks pass, commit and push. Vercel will deploy from the connected Git repository.

## Why the hydration fix works

The header now uses literal navigation destinations on both server and client. The active navigation class is intentionally withheld until the first client effect has run, so a pathname rewrite or stale HMR bundle cannot change the server-rendered `href` attributes during hydration. Clearing `.next` removes the old server/client development bundles that were visible in the supplied error screenshot.
