import type { LayerRecord, ProjectDocumentRecord, SaveProjectInput } from './types';

const PIXEL_COUNT = 32 * 32;
const EMPTY_COLOR = 'transparent';

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as UnknownRecord;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asOptionalPositiveInt(value: unknown): number | undefined | null {
  if (typeof value === 'undefined') {
    return undefined;
  }

  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    return null;
  }

  return value;
}

function asPixelGrid(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length !== PIXEL_COUNT) {
    return null;
  }

  if (!value.every((entry) => typeof entry === 'string')) {
    return null;
  }

  return value;
}

function asOpacity(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0 || value > 100) {
    return null;
  }

  return Math.round(value);
}

function createEmptyPixels(): string[] {
  return Array.from({ length: PIXEL_COUNT }, () => EMPTY_COLOR);
}

function parseLayerForSave(value: unknown): LayerRecord | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const id = asNonEmptyString(record.id);
  const name = asNonEmptyString(record.name);
  const pixels = asPixelGrid(record.pixels);
  const opacity = asOpacity(record.opacity);

  if (!id || !name || !pixels || opacity === null) {
    return null;
  }

  if (typeof record.visible !== 'boolean' || typeof record.locked !== 'boolean') {
    return null;
  }

  return {
    id,
    name,
    pixels,
    visible: record.visible,
    locked: record.locked,
    opacity
  };
}

function parseDocumentForSave(value: unknown): ProjectDocumentRecord | null {
  const record = asRecord(value);
  if (!record || record.version !== 2 || !Array.isArray(record.layers)) {
    return null;
  }

  const layers = record.layers.map((layer) => parseLayerForSave(layer));
  if (layers.some((layer) => layer === null)) {
    return null;
  }

  const validLayers = layers.filter((layer): layer is LayerRecord => layer !== null);
  if (validLayers.length === 0) {
    return null;
  }

  const activeLayerId = asNonEmptyString(record.activeLayerId);
  if (!activeLayerId || !validLayers.some((layer) => layer.id === activeLayerId)) {
    return null;
  }

  return {
    version: 2,
    layers: validLayers,
    activeLayerId
  };
}

function normalizeOpacityForStorage(value: unknown): number {
  return Math.max(0, Math.min(100, Math.round(typeof value === 'number' ? value : 100)));
}

function normalizeLayerForStorage(layer: unknown, index: number): LayerRecord | null {
  const record = asRecord(layer);
  if (!record) {
    return null;
  }

  const normalizedPixels = asPixelGrid(record.pixels) ?? createEmptyPixels();
  const id = asNonEmptyString(record.id) ?? `layer-${index + 1}`;
  const name = asNonEmptyString(record.name) ?? `Layer ${index + 1}`;

  return {
    id,
    name,
    pixels: normalizedPixels,
    visible: record.visible !== false,
    locked: record.locked === true,
    opacity: normalizeOpacityForStorage(record.opacity)
  };
}

function migrateLegacyPixelsToDocument(pixels: unknown): ProjectDocumentRecord {
  const normalizedPixels = asPixelGrid(pixels) ?? createEmptyPixels();
  const baseLayer: LayerRecord = {
    id: 'layer-1',
    name: 'Layer 1',
    pixels: normalizedPixels,
    visible: true,
    locked: false,
    opacity: 100
  };

  return {
    version: 2,
    layers: [baseLayer],
    activeLayerId: baseLayer.id
  };
}

export function parseSaveProjectInput(value: unknown): SaveProjectInput | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const name = asNonEmptyString(record.name);
  if (!name) {
    return null;
  }

  const id = asOptionalPositiveInt(record.id);
  if (id === null) {
    return null;
  }

  const document = parseDocumentForSave(record.document);
  if (!document) {
    return null;
  }

  return {
    id,
    name,
    document
  };
}

export function serializeStoredProjectDocument(document: ProjectDocumentRecord): string {
  return JSON.stringify(document);
}

export function deserializeStoredProjectDocument(raw: string): ProjectDocumentRecord {
  try {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return migrateLegacyPixelsToDocument(parsed);
    }

    const record = asRecord(parsed);
    if (!record) {
      return migrateLegacyPixelsToDocument([]);
    }

    const layers = Array.isArray(record.layers)
      ? record.layers
          .map((layer, index) => normalizeLayerForStorage(layer, index))
          .filter((layer): layer is LayerRecord => layer !== null)
      : [];

    if (layers.length === 0) {
      return migrateLegacyPixelsToDocument([]);
    }

    const activeLayerId = asNonEmptyString(record.activeLayerId);
    const resolvedActiveLayerId =
      activeLayerId && layers.some((layer) => layer.id === activeLayerId)
        ? activeLayerId
        : layers[layers.length - 1]!.id;

    return {
      version: 2,
      layers,
      activeLayerId: resolvedActiveLayerId
    };
  } catch {
    return migrateLegacyPixelsToDocument([]);
  }
}
