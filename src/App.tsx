import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import {
  EMPTY_COLOR,
  GRID_SIZE,
  SCALE,
  cellFromPointer,
  createEmptyPixels,
  drawGrid,
  indexFromCell,
  type Cell,
  type Tool
} from './pixel-grid';
import { ControlPanel } from './components/ControlPanel';
import { PixelCanvas } from './components/PixelCanvas';
import { useProjectActions } from './hooks/useProjectActions';

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPaintingRef = useRef(false);
  const [pixels, setPixels] = useState<string[]>(() => createEmptyPixels());
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [tool, setTool] = useState<Tool>('brush');
  const [projectName, setProjectName] = useState('Untitled');
  const [activeProjectId, setActiveProjectId] = useState<number | undefined>(undefined);

  const canSave = useMemo(() => projectName.trim().length > 0, [projectName]);

  const { projects, status, handleClear, handleSave, handleLoad, handleExport } = useProjectActions({
    activeProjectId,
    projectName,
    pixels,
    canSave,
    setActiveProjectId,
    setProjectName,
    setPixels
  });

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
    (event: PointerEvent<HTMLCanvasElement>) => {
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
    (event: PointerEvent<HTMLCanvasElement>) => {
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

  const handlePointerUp = useCallback((event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }

    isPaintingRef.current = false;
  }, []);

  const handleProjectSelectChange = useCallback((raw: string) => {
    if (raw === '') {
      setActiveProjectId(undefined);
      return;
    }

    const value = Number(raw);
    setActiveProjectId(Number.isFinite(value) && value > 0 ? value : undefined);
  }, []);

  return (
    <div className="app">
      <ControlPanel
        projectName={projectName}
        activeProjectId={activeProjectId}
        projects={projects}
        tool={tool}
        selectedColor={selectedColor}
        canSave={canSave}
        status={status}
        onProjectNameChange={setProjectName}
        onProjectSelectChange={handleProjectSelectChange}
        onToolChange={setTool}
        onColorChange={setSelectedColor}
        onClear={handleClear}
        onSave={handleSave}
        onLoad={handleLoad}
        onExport={handleExport}
      />

      <PixelCanvas
        canvasRef={canvasRef}
        width={GRID_SIZE * SCALE}
        height={GRID_SIZE * SCALE}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
    </div>
  );
}

export default App;
