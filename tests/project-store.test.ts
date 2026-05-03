import { describe, expect, it } from 'vitest';
import {
  deleteProjectFromDb,
  getProjectFromDb,
  initializeProjectSchema,
  listProjectsFromDb,
  saveProjectToDb
} from '../electron/project-store';

const PIXEL_COUNT = 32 * 32;

type Row = {
  id: number;
  name: string;
  pixels: string;
  updated_at: string;
};

class FakeStatement {
  private readonly sql: string;
  private readonly rows: Row[];

  public constructor(sql: string, rows: Row[]) {
    this.sql = sql;
    this.rows = rows;
  }

  public all(): Array<{ id: number; name: string; updated_at: string }> {
    if (!this.sql.includes('SELECT id, name, updated_at FROM projects')) {
      throw new Error(`Unsupported all() query: ${this.sql}`);
    }

    return [...this.rows]
      .sort((a, b) => {
        if (a.updated_at === b.updated_at) {
          return b.id - a.id;
        }
        return a.updated_at < b.updated_at ? 1 : -1;
      })
      .map((row) => ({ id: row.id, name: row.name, updated_at: row.updated_at }));
  }

  public get(id: number): { id: number; name: string; pixels: string; updated_at: string } | undefined {
    if (!this.sql.includes('SELECT id, name, pixels, updated_at FROM projects WHERE id = ?')) {
      throw new Error(`Unsupported get() query: ${this.sql}`);
    }

    return this.rows.find((row) => row.id === id);
  }

  public run(...args: unknown[]): { changes: number; lastInsertRowid: bigint } {
    if (this.sql.includes('UPDATE projects')) {
      const [name, pixels, id] = args as [string, string, number];
      const row = this.rows.find((entry) => entry.id === id);
      if (!row) {
        return { changes: 0, lastInsertRowid: 0n };
      }

      row.name = name;
      row.pixels = pixels;
      row.updated_at = new Date().toISOString();
      return { changes: 1, lastInsertRowid: BigInt(id) };
    }

    if (this.sql.includes('INSERT INTO projects')) {
      const [name, pixels] = args as [string, string];
      const id = this.rows.length > 0 ? this.rows[this.rows.length - 1]!.id + 1 : 1;
      this.rows.push({
        id,
        name,
        pixels,
        updated_at: new Date().toISOString()
      });

      return { changes: 1, lastInsertRowid: BigInt(id) };
    }

    if (this.sql.includes('DELETE FROM projects WHERE id = ?')) {
      const [id] = args as [number];
      const index = this.rows.findIndex((entry) => entry.id === id);
      if (index < 0) {
        return { changes: 0, lastInsertRowid: 0n };
      }

      this.rows.splice(index, 1);
      return { changes: 1, lastInsertRowid: BigInt(id) };
    }

    throw new Error(`Unsupported run() query: ${this.sql}`);
  }
}

class FakeDatabase {
  private readonly rows: Row[] = [];

  public exec(_sql: string): void {
    // Schema creation is a no-op for this in-memory fake.
  }

  public prepare(sql: string): FakeStatement {
    return new FakeStatement(sql, this.rows);
  }

  public seedRow(row: Row): void {
    this.rows.push(row);
  }
}

function makePixels(seed: string): string[] {
  return Array.from({ length: PIXEL_COUNT }, (_, index) =>
    index % 2 === 0 ? seed : 'transparent'
  );
}

function makeDocument(seed: string) {
  return {
    version: 2 as const,
    activeLayerId: 'layer-1',
    layers: [
      {
        id: 'layer-1',
        name: 'Layer 1',
        pixels: makePixels(seed),
        visible: true,
        locked: false,
        opacity: 100
      }
    ]
  };
}

describe('project save/load', () => {
  it('saves and loads a project document', () => {
    const db = new FakeDatabase();
    initializeProjectSchema(db as never);

    const saved = saveProjectToDb(db as never, {
      name: 'Test Project',
      document: makeDocument('#112233')
    });

    expect(saved.id).toBeGreaterThan(0);
    expect(saved.name).toBe('Test Project');
    expect(saved.document.layers).toHaveLength(1);
    expect(saved.document.layers[0]?.pixels).toHaveLength(PIXEL_COUNT);

    const loaded = getProjectFromDb(db as never, saved.id);
    expect(loaded).not.toBeNull();
    expect(loaded?.id).toBe(saved.id);
    expect(loaded?.name).toBe('Test Project');
    expect(loaded?.document).toEqual(saved.document);
  });

  it('updates existing project when id exists', () => {
    const db = new FakeDatabase();
    initializeProjectSchema(db as never);

    const initial = saveProjectToDb(db as never, {
      name: 'Initial',
      document: makeDocument('#000000')
    });

    const updated = saveProjectToDb(db as never, {
      id: initial.id,
      name: 'Updated',
      document: makeDocument('#abcdef')
    });

    expect(updated.id).toBe(initial.id);
    expect(updated.name).toBe('Updated');
    expect(updated.document.layers[0]?.pixels[0]).toBe('#abcdef');

    const all = listProjectsFromDb(db as never);
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe(initial.id);
  });

  it('deletes a project by id', () => {
    const db = new FakeDatabase();
    initializeProjectSchema(db as never);

    const first = saveProjectToDb(db as never, {
      name: 'One',
      document: makeDocument('#111111')
    });
    const second = saveProjectToDb(db as never, {
      name: 'Two',
      document: makeDocument('#222222')
    });

    const deleted = deleteProjectFromDb(db as never, first.id);
    expect(deleted).toBe(true);
    expect(getProjectFromDb(db as never, first.id)).toBeNull();
    expect(getProjectFromDb(db as never, second.id)?.name).toBe('Two');

    const missingDelete = deleteProjectFromDb(db as never, 999999);
    expect(missingDelete).toBe(false);
  });

  it('migrates legacy stored pixel arrays into a layered document', () => {
    const db = new FakeDatabase();
    initializeProjectSchema(db as never);

    db.seedRow({
      id: 42,
      name: 'Legacy',
      pixels: JSON.stringify(makePixels('#909090')),
      updated_at: new Date().toISOString()
    });

    const loaded = getProjectFromDb(db as never, 42);
    expect(loaded).not.toBeNull();
    expect(loaded?.document.version).toBe(2);
    expect(loaded?.document.layers).toHaveLength(1);
    expect(loaded?.document.layers[0]?.pixels[0]).toBe('#909090');
  });
});
