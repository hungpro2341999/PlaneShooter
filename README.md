# PLANESHOOTER

3D low-poly arcade dogfight (Three.js 0.170.0, bundled by Vite 5.4.11).

## Build
```bash
npm ci
npm run build      # -> dist/
```
`vite.config.js` uses `base: './'`, so `dist/` works from any sub-folder
(e.g. GitHub Pages at `https://<user>.github.io/PlaneShooter/`). Three.js is bundled into
`dist/assets/*.js`; no CDN or dev server needed.

## Deploy to GitHub Pages
Copy the contents of `dist/` to the published branch/folder (e.g. `gh-pages` root or `/docs`).

## Controls
Desktop: mouse steer · W/S throttle · A/D roll · Shift boost · LMB gun · RMB missile · Esc pause · M mute.
Mobile: left joystick · FIRE / MISSILE / BOOST / THROTTLE± buttons.
