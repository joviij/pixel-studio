import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from './components/AppShell';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { ColorPanel } from './components/ColorPanel';
import { LayersPanel } from './components/LayersPanel';
import { PixelCanvas } from './components/PixelCanvas';
import { PreviewPanel } from './components/PreviewPanel';
import { StatusBar } from './components/StatusBar';
import { ToolsBar } from './components/ToolsBar';
import { TopBar } from './components/TopBar';
import { useCanvasPainting } from './hooks/useCanvasPainting';
import { useEditorDocument } from './hooks/useEditorDocument';
import { useProjectActions } from './hooks/useProjectActions';
import {
  EMPTY_COLOR,
  GRID_SIZE,
  SCALE,
  addLayer,
  cellFromPointer,
  createDefaultDocument,
  deleteLayer,
  drawDocument,
  getVisibleDocumentCellColor,
  moveLayer,
  paintDocumentCell,
  renameLayer,
  setActiveLayer,
  setLayerLock,
  setLayerOpacity,
  setLayerVisibility,
  type Cell,
  type Tool
} from './pixel-grid';

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [secondaryColor] = useState('#ffffff');
  const [tool, setTool] = useState<Tool>('brush');
  const [projectName, setProjectName] = useState('Untitled');
  const [activeProjectId, setActiveProjectId] = useState<number | undefined>(undefined);

  const canSave = useMemo(() => projectName.trim().length > 0, [projectName]);
  const [status, setStatus] = useState('Ready');

  const { projectDocument, canUndo, canRedo, setProjectDocument, applyProjectDocumentChange, undo, redo } =
    useEditorDocument({
      createInitialDocument: createDefaultDocument,
      setStatus
    });

  const { projects, handleNew, handleClear, handleSave, handleLoad, handleDelete, handleExport } =
    useProjectActions({
      activeProjectId,
      projectName,
      projectDocument,
      canSave,
      setStatus,
      setActiveProjectId,
      setProjectName,
      setProjectDocument
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

    drawDocument(ctx, projectDocument);
  }, [projectDocument]);

  const applyCellTool = useCallback(
    (cell: Cell) => {
      if (tool === 'eyedropper') {
        const color = getVisibleDocumentCellColor(projectDocument, cell);
        if (!color) {
          setStatus('No color at selected cell.');
          return;
        }

        setSelectedColor(color);
        setStatus(`Picked ${color}`);
        return;
      }

      const nextColor = tool === 'eraser' ? EMPTY_COLOR : selectedColor;

      applyProjectDocumentChange((previous) => {
        const result = paintDocumentCell(previous, cell, nextColor);
        if (!result.changed && result.reason) {
          setStatus(result.reason);
        }

        return result.document;
      });
    },
    [applyProjectDocumentChange, projectDocument, selectedColor, setStatus, tool]
  );

  const { cursorCell, handlePointerDown, handlePointerMove, handlePointerUp, handlePointerLeave } =
    useCanvasPainting({
      canvasRef,
      getCellFromPointer: cellFromPointer,
      onPaintCell: applyCellTool
    });

  const activeLayer = projectDocument.layers.find((layer) => layer.id === projectDocument.activeLayerId) ?? null;

  return (
    <AppShell
      topBar={
        <TopBar
          projectName={projectName}
          activeProjectId={activeProjectId}
          projects={projects}
          canSave={canSave}
          canUndo={canUndo}
          canRedo={canRedo}
          onProjectNameChange={setProjectName}
          onNew={handleNew}
          onClear={handleClear}
          onLoad={handleLoad}
          onSave={handleSave}
          onDelete={handleDelete}
          onExport={handleExport}
          onUndo={undo}
          onRedo={redo}
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
          <PreviewPanel projectDocument={projectDocument} />
          <LayersPanel
            layers={projectDocument.layers}
            activeLayerId={projectDocument.activeLayerId}
            activeLayerOpacity={activeLayer?.opacity ?? 100}
            canDeleteLayer={projectDocument.layers.length > 1}
            canMoveLayerUp={
              !!activeLayer &&
              projectDocument.layers.findIndex((layer) => layer.id === activeLayer.id) <
                projectDocument.layers.length - 1
            }
            canMoveLayerDown={
              !!activeLayer && projectDocument.layers.findIndex((layer) => layer.id === activeLayer.id) > 0
            }
            onAddLayer={() => applyProjectDocumentChange((previous) => addLayer(previous))}
            onDeleteLayer={() =>
              applyProjectDocumentChange((previous) => deleteLayer(previous, previous.activeLayerId))
            }
            onMoveLayerUp={() =>
              applyProjectDocumentChange((previous) => moveLayer(previous, previous.activeLayerId, 'up'))
            }
            onMoveLayerDown={() =>
              applyProjectDocumentChange((previous) => moveLayer(previous, previous.activeLayerId, 'down'))
            }
            onSelectLayer={(layerId) =>
              applyProjectDocumentChange((previous) => setActiveLayer(previous, layerId))
            }
            onToggleVisibility={(layerId, visible) =>
              applyProjectDocumentChange((previous) => setLayerVisibility(previous, layerId, visible))
            }
            onToggleLock={(layerId, locked) =>
              applyProjectDocumentChange((previous) => setLayerLock(previous, layerId, locked))
            }
            onRenameLayer={(layerId, name) =>
              applyProjectDocumentChange((previous) => renameLayer(previous, layerId, name))
            }
            onSetOpacity={(opacity) =>
              applyProjectDocumentChange((previous) => setLayerOpacity(previous, previous.activeLayerId, opacity))
            }
          />
        </>
      }
      statusBar={<StatusBar cursorCell={cursorCell} tool={tool} status={status} gridSize={GRID_SIZE} />}
    />
  );
}

export default App;
