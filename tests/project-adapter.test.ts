import { describe, expect, it } from 'vitest';
import { deserializeStoredProjectDocument, parseSaveProjectInput } from '../electron/project-adapter';

const PIXEL_COUNT = 32 * 32;

function makePixels(seed: string): string[] {
  return Array.from({ length: PIXEL_COUNT }, (_, index) => (index % 2 === 0 ? seed : 'transparent'));
}

function makeValidPayload() {
  return {
    id: 7,
    name: '  Test  ',
    document: {
      version: 2 as const,
      activeLayerId: 'layer-1',
      layers: [
        {
          id: 'layer-1',
          name: 'Layer 1',
          pixels: makePixels('#112233'),
          visible: true,
          locked: false,
          opacity: 100
        }
      ]
    }
  };
}

describe('project adapter', () => {
  it('parses valid save input and normalizes name', () => {
    const parsed = parseSaveProjectInput(makeValidPayload());

    expect(parsed).not.toBeNull();
    expect(parsed?.id).toBe(7);
    expect(parsed?.name).toBe('Test');
    expect(parsed?.document.version).toBe(2);
  });

  it('rejects invalid save payloads', () => {
    const invalidOpacity = makeValidPayload();
    invalidOpacity.document.layers[0]!.opacity = 101;

    expect(parseSaveProjectInput({})).toBeNull();
    expect(parseSaveProjectInput({ ...makeValidPayload(), id: -2 })).toBeNull();
    expect(parseSaveProjectInput({ ...makeValidPayload(), name: '   ' })).toBeNull();
    expect(parseSaveProjectInput(invalidOpacity)).toBeNull();
    expect(
      parseSaveProjectInput({
        ...makeValidPayload(),
        document: {
          ...makeValidPayload().document,
          activeLayerId: 'missing-layer'
        }
      })
    ).toBeNull();
  });

  it('migrates legacy pixel arrays when decoding stored data', () => {
    const legacyPixels = makePixels('#445566');
    const decoded = deserializeStoredProjectDocument(JSON.stringify(legacyPixels));

    expect(decoded.layers).toHaveLength(1);
    expect(decoded.layers[0]?.pixels).toEqual(legacyPixels);
  });
});
