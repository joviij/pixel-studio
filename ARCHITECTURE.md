# Architecture (v1 MVP)

## Process Responsibilities

- Renderer (`src/`): React UI and Canvas drawing logic. Holds editor state (layered 32x32 project document, selected tool/color, selected project) and calls exposed preload APIs.
- Main (`electron/main.ts`): Owns app lifecycle, window creation, SQLite access wiring, filesystem writes for PNG export, and IPC handler registration.
- Preload (`electron/preload.ts`): Narrow, typed bridge between renderer and main via `contextBridge` + `ipcRenderer.invoke`.

## Project Data Format

A project is represented as:

- `id: number`
- `name: string`
- `document: { version: 2, layers: Layer[], activeLayerId: string }`
- `updatedAt: string`

Each layer contains a `pixels: string[]` grid (length `1024`, row-major), plus `visible`, `locked`, and `opacity` metadata.
Pixel values are color strings (`#RRGGBB`) or `"transparent"` for empty cells.

## SQLite Schema

Database file: `pixel-studio.sqlite` in Electron `app.getPath('userData')`.

Table:

- `projects`
  - `id INTEGER PRIMARY KEY AUTOINCREMENT`
  - `name TEXT NOT NULL`
  - `pixels TEXT NOT NULL` (JSON-encoded project document; legacy rows may contain `string[]`)
  - `updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP`

## IPC API

Renderer -> Main (`invoke`):

- `projects:list` -> `ProjectSummary[]`
- `projects:get` (`id: number`) -> `ProjectRecord | null`
- `projects:save` (`{ id?, name, document }`) -> `ProjectRecord`
- `dialog:savePng` -> `string | null` (chosen file path)
- `files:writePng` (`filePath: string, bytes: Uint8Array`) -> `true`

All persistence and filesystem writes are handled in main, not renderer.

## Intentionally Out of Scope (v1)

- Selection tools, transforms, flood fill, undo/redo history
- Layer groups/folders, masks, non-normal blend modes
- Animation timeline, onion skinning
- Collaboration/accounts/cloud sync
- Plugin system or extensible architecture
- Complex project metadata/versioning/migrations
- Packaging/distribution pipeline (installers, auto-update)
