# Pixel Studio MVP

A minimal desktop pixel art editor built with Electron + Vite + React + TypeScript. This is an entirely vibe-coded app. Part of the goal was to just test how fast + semi-good vibe coded output app can product working applications. 

## MVP Features

- 32x32 pixel canvas
- Click + drag painting
- Color picker
- Eraser
- Layer stack (add/delete/reorder/rename)
- Layer visibility, lock, and opacity
- Clear canvas
- Save/load projects to local SQLite (`better-sqlite3`)
- Export PNG

## Tech Stack

- Electron (main + preload)
- Vite + React + TypeScript (renderer)
- SQLite via `better-sqlite3`
- Canvas API for drawing

## Project Structure

- `electron/main.ts`: Electron app lifecycle + IPC handlers
- `electron/preload.ts`: Secure renderer bridge
- `electron/db.ts`: SQLite setup and CRUD
- `src/App.tsx`: Pixel editor UI and drawing logic
- `src/types/global.d.ts`: Renderer typings for preload API

## Setup

1. Install dependencies:

```bash
npm install
```

2. Rebuild native module for Electron runtime:

```bash
npm run rebuild
```

3. Start development mode:

```bash
npm run dev
```

## Build and Lint

```bash
npm run lint
npm run build
```

## Notes

- Projects are stored in the app user data directory as `pixel-studio.sqlite`.
- PNG export writes to the path selected in the save dialog.
