export const GRID_SIZE = 32;
export const PIXEL_COUNT = GRID_SIZE * GRID_SIZE;
export const SCALE = 16;
export const EMPTY_COLOR = 'transparent';

export type Tool = 'brush' | 'eraser';

export type Cell = {
  x: number;
  y: number;
};

export function createEmptyPixels(): string[] {
  return Array.from({ length: PIXEL_COUNT }, () => EMPTY_COLOR);
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

export function drawGrid(ctx: CanvasRenderingContext2D, pixels: string[]): void {
  ctx.clearRect(0, 0, GRID_SIZE * SCALE, GRID_SIZE * SCALE);

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#ffffff' : '#f1f1f1';
      ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
    }
  }

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const color = pixels[indexFromCell({ x, y })];
      if (color && color !== EMPTY_COLOR) {
        ctx.fillStyle = color;
        ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
      }
    }
  }

  ctx.strokeStyle = '#c8ccd0';
  ctx.lineWidth = 1;

  for (let i = 0; i <= GRID_SIZE; i += 1) {
    const linePos = i * SCALE;

    ctx.beginPath();
    ctx.moveTo(linePos + 0.5, 0);
    ctx.lineTo(linePos + 0.5, GRID_SIZE * SCALE);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, linePos + 0.5);
    ctx.lineTo(GRID_SIZE * SCALE, linePos + 0.5);
    ctx.stroke();
  }
}

export function renderToExportCanvas(pixels: string[]): HTMLCanvasElement {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = GRID_SIZE;
  exportCanvas.height = GRID_SIZE;
  const ctx = exportCanvas.getContext('2d');

  if (!ctx) {
    throw new Error('Unable to create export context.');
  }

  ctx.clearRect(0, 0, GRID_SIZE, GRID_SIZE);

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const color = pixels[indexFromCell({ x, y })];
      if (color && color !== EMPTY_COLOR) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  return exportCanvas;
}
