# Architecture (v1 MVP)

## Process Responsibilities

- Renderer (`src/`): React UI and Canvas drawing logic. Holds editor state (32x32 pixels, selected tool/color, selected project) and calls exposed preload APIs.
- Main (`electron/main.ts`): Owns app lifecycle, window creation, SQLite access wiring, filesystem writes for PNG export, and IPC handler registration.
- Preload (`electron/preload.ts`): Narrow, typed bridge between renderer and main via `contextBridge` + `ipcRenderer.invoke`.

## Project Data Format

A project is represented as:

- `id: number`
- `name: string`
- `pixels: string[]` (length `1024`, row-major for 32x32)
- `updatedAt: string`

Pixel values are color strings (`#RRGGBB`) or `"transparent"` for empty cells.

## SQLite Schema

Database file: `pixel-studio.sqlite` in Electron `app.getPath('userData')`.

Table:

- `projects`
  - `id INTEGER PRIMARY KEY AUTOINCREMENT`
  - `name TEXT NOT NULL`
  - `pixels TEXT NOT NULL` (JSON-encoded `string[]`)
  - `updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP`

## IPC API

Renderer -> Main (`invoke`):

- `projects:list` -> `ProjectSummary[]`
- `projects:get` (`id: number`) -> `ProjectRecord | null`
- `projects:save` (`{ id?, name, pixels }`) -> `ProjectRecord`
- `dialog:savePng` -> `string | null` (chosen file path)
- `files:writePng` (`filePath: string, bytes: Uint8Array`) -> `true`

All persistence and filesystem writes are handled in main, not renderer.

## Intentionally Out of Scope (v1)

- Layers, animation timeline, onion skinning
- Selection tools, transforms, flood fill, undo/redo history
- Collaboration/accounts/cloud sync
- Plugin system or extensible architecture
- Complex project metadata/versioning/migrations
- Packaging/distribution pipeline (installers, auto-update)
