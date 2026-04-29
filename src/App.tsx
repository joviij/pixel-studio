import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ProjectSummary } from '../electron/types';
import { dataUrlToBytes } from './png-export';

const GRID_SIZE = 32;
const PIXEL_COUNT = GRID_SIZE * GRID_SIZE;
const SCALE = 16;
const EMPTY_COLOR = 'transparent';

type Tool = 'brush' | 'eraser';

type Cell = {
  x: number;
  y: number;
};

function createEmptyPixels(): string[] {
  return Array.from({ length: PIXEL_COUNT }, () => EMPTY_COLOR);
}

function indexFromCell(cell: Cell): number {
  return cell.y * GRID_SIZE + cell.x;
}

function cellFromPointer(canvas: HTMLCanvasElement, clientX: number, clientY: number): Cell | null {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((clientX - rect.left) / SCALE);
  const y = Math.floor((clientY - rect.top) / SCALE);

  if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
    return null;
  }

  return { x, y };
}

function drawGrid(ctx: CanvasRenderingContext2D, pixels: string[]): void {
  ctx.clearRect(0, 0, GRID_SIZE * SCALE, GRID_SIZE * SCALE);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, GRID_SIZE * SCALE, GRID_SIZE * SCALE);

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const color = pixels[indexFromCell({ x, y })];
      if (color && color !== EMPTY_COLOR) {
        ctx.fillStyle = color;
        ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
      }
    }
  }

  ctx.strokeStyle = '#e5e7eb';
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

function renderToExportCanvas(pixels: string[]): HTMLCanvasElement {
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

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPaintingRef = useRef(false);
  const [pixels, setPixels] = useState<string[]>(() => createEmptyPixels());
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [tool, setTool] = useState<Tool>('brush');
  const [projectName, setProjectName] = useState('Untitled');
  const [activeProjectId, setActiveProjectId] = useState<number | undefined>(undefined);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [status, setStatus] = useState('Ready');

  const canSave = useMemo(() => projectName.trim().length > 0, [projectName]);

  const refreshProjects = useCallback(async () => {
    const items = await window.pixelStudio.listProjects();
    setProjects(items);
  }, []);

  useEffect(() => {
    refreshProjects().catch((error: unknown) => {
      setStatus(`Failed to load projects: ${String(error)}`);
    });
  }, [refreshProjects]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    drawGrid(ctx, pixels);
  }, [pixels]);

  const paintCell = useCallback(
    (cell: Cell) => {
      const nextColor = tool === 'eraser' ? EMPTY_COLOR : selectedColor;

      setPixels((previous) => {
        const idx = indexFromCell(cell);
        if (previous[idx] === nextColor) {
          return previous;
        }

        const next = [...previous];
        next[idx] = nextColor;
        return next;
      });
    },
    [selectedColor, tool]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      canvas.setPointerCapture(event.pointerId);
      isPaintingRef.current = true;

      const cell = cellFromPointer(canvas, event.clientX, event.clientY);
      if (cell) {
        paintCell(cell);
      }
    },
    [paintCell]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isPaintingRef.current) {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const cell = cellFromPointer(canvas, event.clientX, event.clientY);
      if (cell) {
        paintCell(cell);
      }
    },
    [paintCell]
  );

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }

    isPaintingRef.current = false;
  }, []);

  const handleClear = useCallback(() => {
    setPixels(createEmptyPixels());
    setStatus('Canvas cleared');
  }, []);

  const handleSave = useCallback(async () => {
    if (!canSave) {
      setStatus('Name is required to save.');
      return;
    }

    try {
      const saved = await window.pixelStudio.saveProject({
        id: activeProjectId,
        name: projectName.trim(),
        pixels
      });

      setActiveProjectId(saved.id);
      setProjectName(saved.name);
      await refreshProjects();
      setStatus(`Saved project #${saved.id}`);
    } catch (error: unknown) {
      setStatus(`Save failed: ${String(error)}`);
    }
  }, [activeProjectId, canSave, pixels, projectName, refreshProjects]);

  const handleLoad = useCallback(async () => {
    if (!activeProjectId) {
      setStatus('Select a project to load.');
      return;
    }

    try {
      const project = await window.pixelStudio.getProject(activeProjectId);
      if (!project) {
        setStatus('Project was not found.');
        return;
      }

      const normalized = project.pixels.length === PIXEL_COUNT ? project.pixels : createEmptyPixels();
      setPixels(normalized);
      setProjectName(project.name);
      setStatus(`Loaded project #${project.id}`);
    } catch (error: unknown) {
      setStatus(`Load failed: ${String(error)}`);
    }
  }, [activeProjectId]);

  const handleExport = useCallback(async () => {
    try {
      const filePath = await window.pixelStudio.chooseExportPath();
      if (!filePath) {
        setStatus('Export canceled.');
        return;
      }

      const exportCanvas = renderToExportCanvas(pixels);
      const pngBytes = await dataUrlToBytes(exportCanvas.toDataURL('image/png'));
      await window.pixelStudio.writePng(filePath, pngBytes);
      setStatus(`Exported PNG to ${filePath}`);
    } catch (error: unknown) {
      setStatus(`Export failed: ${String(error)}`);
    }
  }, [pixels]);

  return (
    <div className="app">
      <aside className="panel">
        <h1>Pixel Studio MVP</h1>

        <label className="field" htmlFor="project-name">
          Project Name
        </label>
        <input
          id="project-name"
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          placeholder="Untitled"
        />

        <label className="field" htmlFor="project-select">
          Saved Projects
        </label>
        <select
          id="project-select"
          value={activeProjectId ?? ''}
          onChange={(event) => {
            const raw = event.target.value;
            if (raw === '') {
              setActiveProjectId(undefined);
              return;
            }

            const value = Number(raw);
            setActiveProjectId(Number.isFinite(value) && value > 0 ? value : undefined);
          }}
        >
          <option value="">New Project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              #{project.id} {project.name}
            </option>
          ))}
        </select>

        <div className="tool-row">
          <button
            className={tool === 'brush' ? 'active' : ''}
            type="button"
            onClick={() => setTool('brush')}
          >
            Brush
          </button>
          <button
            className={tool === 'eraser' ? 'active' : ''}
            type="button"
            onClick={() => setTool('eraser')}
          >
            Eraser
          </button>
        </div>

        <label className="field" htmlFor="color">
          Color
        </label>
        <input
          id="color"
          type="color"
          value={selectedColor}
          onChange={(event) => setSelectedColor(event.target.value)}
          disabled={tool === 'eraser'}
        />

        <div className="actions">
          <button type="button" onClick={handleClear}>
            Clear Canvas
          </button>
          <button type="button" onClick={handleSave} disabled={!canSave}>
            Save Project
          </button>
          <button type="button" onClick={handleLoad} disabled={!activeProjectId}>
            Load Project
          </button>
          <button type="button" onClick={handleExport}>
            Export PNG
          </button>
        </div>

        <p className="status">{status}</p>
      </aside>

      <main className="workspace">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * SCALE}
          height={GRID_SIZE * SCALE}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </main>
    </div>
  );
}

export default App;
