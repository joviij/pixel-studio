import { describe, expect, it } from 'vitest';
import { deserializeProjectDocument, serializeProjectDocument } from '../electron/project-serialization';

const PIXEL_COUNT = 32 * 32;

function makePixels(seed: string): string[] {
  return Array.from({ length: PIXEL_COUNT }, (_, index) => (index % 2 === 0 ? seed : 'transparent'));
}

describe('project serialization', () => {
  it('round-trips a layered project document', () => {
    const document = {
      version: 2 as const,
      activeLayerId: 'layer-2',
      layers: [
        {
          id: 'layer-1',
          name: 'Base',
          pixels: makePixels('#000000'),
          visible: true,
          locked: false,
          opacity: 100
        },
        {
          id: 'layer-2',
          name: 'Details',
          pixels: makePixels('#ffffff'),
          visible: true,
          locked: false,
          opacity: 75
        }
      ]
    };

    const raw = serializeProjectDocument(document);
    expect(deserializeProjectDocument(raw)).toEqual(document);
  });

  it('migrates legacy pixel arrays into a single-layer document', () => {
    const legacyPixels = makePixels('#112233');
    const migrated = deserializeProjectDocument(JSON.stringify(legacyPixels));

    expect(migrated.version).toBe(2);
    expect(migrated.layers).toHaveLength(1);
    expect(migrated.layers[0]?.pixels).toEqual(legacyPixels);
    expect(migrated.activeLayerId).toBe(migrated.layers[0]?.id);
  });

  it('returns a default single-layer document for invalid JSON', () => {
    const migrated = deserializeProjectDocument('{not-json');

    expect(migrated.version).toBe(2);
    expect(migrated.layers).toHaveLength(1);
    expect(migrated.layers[0]?.pixels).toHaveLength(PIXEL_COUNT);
  });
});
