# Pixel Studio MVP

A minimal desktop pixel art editor built with Electron + Vite + React + TypeScript. This is an entirely vibe-coded app. Part of the goal was to just test how fast and how good vibe coded output would be especially when tacking on new features. 


One thing to note is the agent (Codex) was not really trained on my personal coding standards and this is sort of out of the box default behavior. 

## Tech Stack

- Electron (main + preload)
- Vite + React + TypeScript (renderer)
- SQLite via `better-sqlite3`
- Canvas API for drawing


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
