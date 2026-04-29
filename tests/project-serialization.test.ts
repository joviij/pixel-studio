import { describe, expect, it } from 'vitest';
import { deserializePixels, serializePixels } from '../electron/project-serialization';

describe('project serialization', () => {
  it('round-trips a pixel array', () => {
    const pixels = ['#000000', 'transparent', '#ffffff'];
    const raw = serializePixels(pixels);

    expect(raw).toBe('["#000000","transparent","#ffffff"]');
    expect(deserializePixels(raw)).toEqual(pixels);
  });

  it('returns empty array for invalid JSON', () => {
    expect(deserializePixels('{nope')).toEqual([]);
  });

  it('returns empty array for non-array JSON', () => {
    expect(deserializePixels('{"a":1}')).toEqual([]);
  });
});
