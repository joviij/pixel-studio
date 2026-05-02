import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { AppShell } from './components/AppShell';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { ColorPanel } from './components/ColorPanel';
import { LayersPanel } from './components/LayersPanel';
import { PixelCanvas } from './components/PixelCanvas';
import { PreviewPanel } from './components/PreviewPanel';
import { StatusBar } from './components/StatusBar';
import { ToolsBar } from './components/ToolsBar';
import { TopBar } from './components/TopBar';
import { useProjectActions } from './hooks/useProjectActions';
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

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPaintingRef = useRef(false);

  const [pixels, setPixels] = useState<string[]>(() => createEmptyPixels());
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [secondaryColor] = useState('#ffffff');
  const [tool, setTool] = useState<Tool>('brush');
  const [projectName, setProjectName] = useState('Untitled');
  const [activeProjectId, setActiveProjectId] = useState<number | undefined>(undefined);
  const [cursorCell, setCursorCell] = useState<Cell | null>(null);

  const canSave = useMemo(() => projectName.trim().length > 0, [projectName]);

  const { projects, status, handleNew, handleClear, handleSave, handleLoad, handleDelete, handleExport } =
    useProjectActions({
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

  const updateCursor = useCallback((event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setCursorCell(null);
      return null;
    }

    const cell = cellFromPointer(canvas, event.clientX, event.clientY);
    setCursorCell(cell);
    return cell;
  }, []);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      canvas.setPointerCapture(event.pointerId);
      isPaintingRef.current = true;

      const cell = updateCursor(event);
      if (cell) {
        paintCell(cell);
      }
    },
    [paintCell, updateCursor]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      const cell = updateCursor(event);
      if (!isPaintingRef.current || !cell) {
        return;
      }

      paintCell(cell);
    },
    [paintCell, updateCursor]
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (canvas && canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }

      isPaintingRef.current = false;
      updateCursor(event);
    },
    [updateCursor]
  );

  const handlePointerLeave = useCallback((event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }

    isPaintingRef.current = false;
    setCursorCell(null);
  }, []);

  return (
    <AppShell
      topBar={
        <TopBar
          projectName={projectName}
          activeProjectId={activeProjectId}
          projects={projects}
          canSave={canSave}
          onProjectNameChange={setProjectName}
          onNew={handleNew}
          onClear={handleClear}
          onLoad={handleLoad}
          onSave={handleSave}
          onDelete={handleDelete}
          onExport={handleExport}
        />
      }
      leftSidebar={
        <>
          <ToolsBar tool={tool} onToolChange={setTool} />
          <ColorPanel
            primaryColor={selectedColor}
            secondaryColor={secondaryColor}
            onPrimaryColorChange={setSelectedColor}
          />
        </>
      }
      workspace={
        <CanvasWorkspace>
          <PixelCanvas
            canvasRef={canvasRef}
            width={GRID_SIZE * SCALE}
            height={GRID_SIZE * SCALE}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
          />
        </CanvasWorkspace>
      }
      rightSidebar={
        <>
          <PreviewPanel pixels={pixels} />
          <LayersPanel />
        </>
      }
      statusBar={<StatusBar cursorCell={cursorCell} tool={tool} status={status} gridSize={GRID_SIZE} />}
    />
  );
}

export default App;
