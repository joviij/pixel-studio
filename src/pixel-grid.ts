export const GRID_SIZE = 32;
export const PIXEL_COUNT = GRID_SIZE * GRID_SIZE;
export const SCALE = 16;
export const EMPTY_COLOR = 'transparent';

export type Tool = 'brush' | 'eraser' | 'eyedropper';

export type Cell = {
  x: number;
  y: number;
};

export type Layer = {
  id: string;
  name: string;
  pixels: string[];
  visible: boolean;
  locked: boolean;
  opacity: number;
};

export type ProjectDocument = {
  version: 2;
  layers: Layer[];
  activeLayerId: string;
};

function normalizeOpacity(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function nextLayerName(index: number): string {
  return `Layer ${index}`;
}

export function createEmptyPixels(): string[] {
  return Array.from({ length: PIXEL_COUNT }, () => EMPTY_COLOR);
}

export function createLayer(name = 'Layer 1'): Layer {
  return {
    id: createLayerId(),
    name,
    pixels: createEmptyPixels(),
    visible: true,
    locked: false,
    opacity: 100
  };
}

export function createDefaultDocument(): ProjectDocument {
  const baseLayer = createLayer('Layer 1');
  return {
    version: 2,
    layers: [baseLayer],
    activeLayerId: baseLayer.id
  };
}

export function indexFromCell(cell: Cell): number {
  return cell.y * GRID_SIZE + cell.x;
}

export function cellFromPointer(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number
): Cell | null {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((clientX - rect.left) / SCALE);
  const y = Math.floor((clientY - rect.top) / SCALE);

  if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
    return null;
  }

  return { x, y };
}

function drawCheckerboard(ctx: CanvasRenderingContext2D, scale: number): void {
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#ffffff' : '#f1f1f1';
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
}

function drawPixelLayers(ctx: CanvasRenderingContext2D, layers: Layer[], scale: number): void {
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const idx = indexFromCell({ x, y });
      for (let layerIndex = 0; layerIndex < layers.length; layerIndex += 1) {
        const layer = layers[layerIndex];
        if (!layer || !layer.visible || layer.opacity <= 0) {
          continue;
        }

        const color = layer.pixels[idx];
        if (!color || color === EMPTY_COLOR) {
          continue;
        }

        ctx.globalAlpha = layer.opacity / 100;
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }

  ctx.globalAlpha = 1;
}

function drawGridLines(ctx: CanvasRenderingContext2D, scale: number): void {
  ctx.strokeStyle = '#c8ccd0';
  ctx.lineWidth = 1;

  for (let i = 0; i <= GRID_SIZE; i += 1) {
    const linePos = i * scale;

    ctx.beginPath();
    ctx.moveTo(linePos + 0.5, 0);
    ctx.lineTo(linePos + 0.5, GRID_SIZE * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, linePos + 0.5);
    ctx.lineTo(GRID_SIZE * scale, linePos + 0.5);
    ctx.stroke();
  }
}

export function drawDocument(ctx: CanvasRenderingContext2D, document: ProjectDocument): void {
  ctx.clearRect(0, 0, GRID_SIZE * SCALE, GRID_SIZE * SCALE);
  drawCheckerboard(ctx, SCALE);
  drawPixelLayers(ctx, document.layers, SCALE);
  drawGridLines(ctx, SCALE);
}

export function renderDocumentToExportCanvas(projectDocument: ProjectDocument): HTMLCanvasElement {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = GRID_SIZE;
  exportCanvas.height = GRID_SIZE;
  const ctx = exportCanvas.getContext('2d');

  if (!ctx) {
    throw new Error('Unable to create export context.');
  }

  ctx.clearRect(0, 0, GRID_SIZE, GRID_SIZE);
  drawPixelLayers(ctx, projectDocument.layers, 1);

  return exportCanvas;
}

export function getVisibleDocumentCellColor(document: ProjectDocument, cell: Cell): string | null {
  const idx = indexFromCell(cell);

  for (let layerIndex = document.layers.length - 1; layerIndex >= 0; layerIndex -= 1) {
    const layer = document.layers[layerIndex];
    if (!layer || !layer.visible || layer.opacity <= 0) {
      continue;
    }

    const color = layer.pixels[idx];
    if (color && color !== EMPTY_COLOR) {
      return color;
    }
  }

  return null;
}

function findLayerIndex(layers: Layer[], layerId: string): number {
  return layers.findIndex((layer) => layer.id === layerId);
}

function countNamedLayers(layers: Layer[]): number {
  return layers.filter((layer) => /^Layer \d+$/.test(layer.name)).length;
}

export function addLayer(document: ProjectDocument): ProjectDocument {
  const layerNumber = Math.max(countNamedLayers(document.layers) + 1, document.layers.length + 1);
  const nextLayer = createLayer(nextLayerName(layerNumber));

  return {
    ...document,
    layers: [...document.layers, nextLayer],
    activeLayerId: nextLayer.id
  };
}

export function deleteLayer(document: ProjectDocument, layerId: string): ProjectDocument {
  if (document.layers.length <= 1) {
    return document;
  }

  const index = findLayerIndex(document.layers, layerId);
  if (index < 0) {
    return document;
  }

  const nextLayers = document.layers.filter((layer) => layer.id !== layerId);
  const nextIndex = Math.min(index, nextLayers.length - 1);
  const nextActiveLayer = nextLayers[nextIndex];
  if (!nextActiveLayer) {
    return document;
  }

  return {
    ...document,
    layers: nextLayers,
    activeLayerId: document.activeLayerId === layerId ? nextActiveLayer.id : document.activeLayerId
  };
}

export function setActiveLayer(document: ProjectDocument, layerId: string): ProjectDocument {
  if (findLayerIndex(document.layers, layerId) < 0) {
    return document;
  }

  return {
    ...document,
    activeLayerId: layerId
  };
}

export function renameLayer(document: ProjectDocument, layerId: string, name: string): ProjectDocument {
  const trimmed = name.trim();
  if (!trimmed) {
    return document;
  }

  return {
    ...document,
    layers: document.layers.map((layer) => (layer.id === layerId ? { ...layer, name: trimmed } : layer))
  };
}

export function setLayerVisibility(document: ProjectDocument, layerId: string, visible: boolean): ProjectDocument {
  return {
    ...document,
    layers: document.layers.map((layer) => (layer.id === layerId ? { ...layer, visible } : layer))
  };
}

export function setLayerLock(document: ProjectDocument, layerId: string, locked: boolean): ProjectDocument {
  return {
    ...document,
    layers: document.layers.map((layer) => (layer.id === layerId ? { ...layer, locked } : layer))
  };
}

export function setLayerOpacity(document: ProjectDocument, layerId: string, opacity: number): ProjectDocument {
  const normalized = normalizeOpacity(opacity);
  return {
    ...document,
    layers: document.layers.map((layer) => (layer.id === layerId ? { ...layer, opacity: normalized } : layer))
  };
}

export function moveLayer(document: ProjectDocument, layerId: string, direction: 'up' | 'down'): ProjectDocument {
  const index = findLayerIndex(document.layers, layerId);
  if (index < 0) {
    return document;
  }

  const targetIndex = direction === 'up' ? index + 1 : index - 1;
  if (targetIndex < 0 || targetIndex >= document.layers.length) {
    return document;
  }

  const nextLayers = [...document.layers];
  const movingLayer = nextLayers[index];
  const destinationLayer = nextLayers[targetIndex];
  if (!movingLayer || !destinationLayer) {
    return document;
  }

  nextLayers[index] = destinationLayer;
  nextLayers[targetIndex] = movingLayer;

  return {
    ...document,
    layers: nextLayers
  };
}

export function paintDocumentCell(
  document: ProjectDocument,
  cell: Cell,
  color: string
): { document: ProjectDocument; changed: boolean; reason?: string } {
  const activeLayer = document.layers.find((layer) => layer.id === document.activeLayerId);
  if (!activeLayer) {
    return { document, changed: false, reason: 'No active layer selected.' };
  }

  if (!activeLayer.visible) {
    return { document, changed: false, reason: 'Active layer is hidden.' };
  }

  if (activeLayer.locked) {
    return { document, changed: false, reason: 'Active layer is locked.' };
  }

  const idx = indexFromCell(cell);
  if (activeLayer.pixels[idx] === color) {
    return { document, changed: false };
  }

  const nextLayers = document.layers.map((layer) => {
    if (layer.id !== activeLayer.id) {
      return layer;
    }

    const nextPixels = [...layer.pixels];
    nextPixels[idx] = color;
    return {
      ...layer,
      pixels: nextPixels
    };
  });

  return {
    document: {
      ...document,
      layers: nextLayers
    },
    changed: true
  };
}

function createLayerId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `layer-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
