import { describe, expect, it, vi } from 'vitest';
import { dataUrlToBytes } from '../src/png-export';

describe('png export helper', () => {
  it('converts data URL response bytes to Uint8Array', async () => {
    const bytes = new Uint8Array([137, 80, 78, 71, 1, 2, 3]);
    const blob = new Blob([bytes], { type: 'image/png' });

    const fetchMock = vi.fn(async () => new Response(blob)) as unknown as typeof fetch;

    const result = await dataUrlToBytes('data:image/png;base64,AAA=', fetchMock);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual(bytes);
  });
});
