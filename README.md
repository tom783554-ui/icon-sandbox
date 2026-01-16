# ICU Room Viewer (Three.js V1)

A lightweight, iPhone-Safari-friendly ICU room viewer built with Vite, TypeScript, and Three.js. This V1 uses low-poly primitives to keep load times fast while delivering touch-friendly camera controls, tap-to-select, and a minimal HUD.

## Local development

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

## Build

```bash
npm run build
```

The production build output is written to `dist/` (standard Vite output).

## Deploy to Vercel

1. Create a new Vercel project pointing to this repo.
2. Framework preset: **Vite** (default).
3. Build command: `npm run build`.
4. Output directory: `dist`.

No environment variables are required.

## iPhone Safari checklist

- ✅ Touch controls feel responsive (rotate with one finger, pinch to zoom).
- ✅ Selection via tap highlights the object and updates the HUD.
- ✅ Loading overlay shows progress and retry button on errors.
- ✅ Device pixel ratio is capped for performance on mobile.
- ✅ Rendering pauses when the tab is hidden.
- ✅ WebGL context loss shows a recovery message.
