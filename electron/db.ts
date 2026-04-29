import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import Database from 'better-sqlite3';
import type { ProjectRecord, ProjectSummary, SaveProjectInput } from './types';
import {
  getProjectFromDb,
  initializeProjectSchema,
  listProjectsFromDb,
  saveProjectToDb
} from './project-store';

const DB_NAME = 'pixel-studio.sqlite';

let db: Database.Database | null = null;

function getDatabaseFilePath(): string {
  const userDataDir = app.getPath('userData');
  fs.mkdirSync(userDataDir, { recursive: true });
  return path.join(userDataDir, DB_NAME);
}

function getDb(): Database.Database {
  if (db) {
    return db;
  }

  const dbPath = getDatabaseFilePath();
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  initializeProjectSchema(db);

  return db;
}

export function listProjects(): ProjectSummary[] {
  return listProjectsFromDb(getDb());
}

export function getProject(id: number): ProjectRecord | null {
  return getProjectFromDb(getDb(), id);
}

export function saveProject(input: SaveProjectInput): ProjectRecord {
  return saveProjectToDb(getDb(), input);
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
