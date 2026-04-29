export function serializePixels(pixels: string[]): string {
  return JSON.stringify(pixels);
}

export function deserializePixels(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Ignore parse errors and fallback to empty pixels.
  }

  return [];
}
