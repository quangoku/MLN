# PhiloVerse Developer & Agent Guide

## Environment & CLI Quirks

- **Windows PowerShell Execution Policy**: Running `npm` or `npx` directly can fail with a `PSSecurityException` (`npm.ps1 cannot be loaded`). Always invoke via `npm.cmd`, `npx.cmd`, or `node`.
- **No NPM Test Script**: `package.json` has no `"test"` script, but tests exist and use Node's native test runner (`node:test`).

## Core Commands

- **Start Dev Server**: `npm.cmd run dev`
- **Run All Tests**: `node --test`
- **Run a Single Test**: `node --test src/world/doorways.test.js` or `node --test src/exhibits/nearestExhibit.test.js`
- **Production Build**: `npm.cmd run build` (outputs to `dist/`, base is `./`)
- **Single-File Distribution**: `npm.cmd run build:single` (builds to `dist/` and runs `scripts/single-file.mjs` to bundle into a self-contained `PhiloVerse.html` runnable directly via `file://`)
- **Preview Build**: `npm.cmd run preview`

## Architecture & Entry Points

- **Root Entrypoint**: `src/main.jsx` mounts `src/App.jsx`.
- **Dual-App Mode via Portal (`src/store/usePortalStore.js`)**:
  - `gameMode: null` → Renders `PortalScreen.jsx` (the 2D portal hub to pick a world).
  - `gameMode: 'philosophy'` → PhiloVerse 2.5D museum (React + `@react-three/fiber` + Zustand).
  - `gameMode: 'economy'` → `EconomyMazeScreen.jsx`, which embeds the standalone 3D world in `public/game-maze/index.html` via `<iframe>`. Inter-app communication occurs through `window.postMessage('ECONOMY_MAZE_BACK_TO_PORTAL')`.
- **PhiloVerse Internal Navigation (`src/store/useMuseumStore.js`)**:
  - `inSpaceScene: false` → Ground museum (isometric camera, exhibits, NPCs).
  - `inSpaceScene: true` → Approaching the lobby Sun triggers the warp transition to `SpaceScene.jsx` (perspective camera, OrbitControls, 8 planets). Pressing `Esc` exits back to the museum lobby.
- **Embedded Subproject (`public/game-maze/`)**:
  - A standalone Three.js + Cannon-es app with its own `package.json` and `vite.config.js` (dev server port 5174).
  - Uses browser import maps pointing to unpkg CDN for Three.js.
  - Automatically copied to `dist/game-maze/` by Vite during the root build.

## Codebase Conventions & Constraints

- **Strict Data vs Layout Boundary**:
  - `src/data/` (`museum.js`, `chapter1.js`, `chapter2.js`, `chapter3.js`): Pure curriculum text and metadata. Do **not** place 3D coordinates, Three.js objects, or math here.
  - `src/world/layout.js`: The **single source of truth** for all spatial coordinates, room geometry, walls, doorways, exhibit placements, collision boundaries (`COLLIDERS`), and visitor waypoints (`VISIT_POINTS`). Components must read from layout rather than hardcoding coordinates.
- **Coordinates & Camera**:
  - Y is vertical (`y = 0` is the floor). 1 unit = 1 floor tile.
  - Museum uses an `OrthographicCamera` fixed at isometric offset `[10, 10, 10]`.
  - Input directions are rotated 45° to match isometric view: `W = (-1, 0, -1)`, `S = (1, 0, 1)`, `A = (-1, 0, 1)`, `D = (1, 0, -1)`.
- **Procedural Assets Only in PhiloVerse**:
  - No external `.glb`/`.gltf` models, image files, or audio clips are loaded in the PhiloVerse app.
  - Textures are procedurally rendered onto 2D canvases (`src/world/textures.js`).
  - Audio is synthesized at runtime with the Web Audio API (`src/audio/sfx.js`).
- **Post-Processing Glow**:
  - Bloom threshold is set to `1.0` in `src/scene/Effects.jsx`. Materials only glow if `toneMapped={false}` and `emissive` color intensity > 1.
