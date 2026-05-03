import type Database from 'better-sqlite3';
import type { ProjectRecord, ProjectSummary, SaveProjectInput } from './types';
import { deserializeProjectDocument, serializeProjectDocument } from './project-serialization';

export function initializeProjectSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      pixels TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function listProjectsFromDb(database: Database.Database): ProjectSummary[] {
  const rows = database
    .prepare('SELECT id, name, updated_at FROM projects ORDER BY updated_at DESC, id DESC')
    .all() as Array<{ id: number; name: string; updated_at: string }>;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    updatedAt: row.updated_at
  }));
}

export function getProjectFromDb(database: Database.Database, id: number): ProjectRecord | null {
  const row = database
    .prepare('SELECT id, name, pixels, updated_at FROM projects WHERE id = ?')
    .get(id) as
    | { id: number; name: string; pixels: string; updated_at: string }
    | undefined;

  if (!row) {
    return null;
  }

  const document = deserializeProjectDocument(row.pixels);

  return {
    id: row.id,
    name: row.name,
    document,
    updatedAt: row.updated_at
  };
}

export function saveProjectToDb(database: Database.Database, input: SaveProjectInput): ProjectRecord {
  const payload = serializeProjectDocument(input.document);

  if (typeof input.id === 'number') {
    const updateResult = database
      .prepare(
        `
          UPDATE projects
          SET name = ?, pixels = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `
      )
      .run(input.name, payload, input.id);

    if (updateResult.changes > 0) {
      const updated = getProjectFromDb(database, input.id);
      if (updated) {
        return updated;
      }
    }
  }

  const insertResult = database
    .prepare(
      `
        INSERT INTO projects (name, pixels, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `
    )
    .run(input.name, payload);

  const id = Number(insertResult.lastInsertRowid);
  const inserted = getProjectFromDb(database, id);
  if (!inserted) {
    throw new Error('Failed to fetch saved project.');
  }

  return inserted;
}

export function deleteProjectFromDb(database: Database.Database, id: number): boolean {
  const result = database.prepare('DELETE FROM projects WHERE id = ?').run(id);
  return result.changes > 0;
}
