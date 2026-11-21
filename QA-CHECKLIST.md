# Final QA checklist

## Local functional checks

- [ ] `/` opens with the village hero and navigation.
- [ ] Navigation links always point to the same destinations; no hydration overlay appears.
- [ ] `/world` opens and each of the six map pins selects the correct destination.
- [ ] Marking a place visited updates the progress bar and persists after refreshing the same tab.
- [ ] `/experiences` opens without errors.
- [ ] Little Surprise returns a new suggestion when opened again.
- [ ] Memory Match starts, counts moves/time, completes all six pairs and can be replayed.
- [ ] Wish Jar validates empty input, adds wishes and restores them after refresh in the same tab.
- [ ] Card Studio preview updates with recipient, sender, message, colors and ornament.
- [ ] Copy greeting and export PNG work in a secure browser context.
- [ ] Gallery thumbnails open the lightbox; arrows, Escape and close button work.
- [ ] Sound is silent by default and only plays after explicit opt-in; toggle turns it off.
- [ ] Snow toggle works on homepage.

## Responsive/accessibility checks

- [ ] Desktop navigation fits at 1280px and above.
- [ ] Mobile menu opens, closes and exposes sound/card actions.
- [ ] Map can be explored through the destination list on a phone.
- [ ] Gallery lightbox fits phone width and can be closed.
- [ ] Keyboard focus is visible; skip navigation link reaches the page content.
- [ ] Reduced-motion preference leaves all content visible and suppresses animation.

## Delivery checks

- [ ] `npm install` completes on the deployment machine.
- [ ] `npm run build` completes without errors.
- [ ] `npm run start` serves all three routes.
- [ ] Vercel deployment has no missing asset or route errors.
- [ ] `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` and `/icon.svg` return successfully.
