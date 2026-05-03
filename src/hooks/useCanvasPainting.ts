import { useCallback, useRef, useState } from 'react';
import type { PointerEvent, RefObject } from 'react';
import type { Cell } from '../pixel-grid';

type UseCanvasPaintingParams = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  getCellFromPointer: (canvas: HTMLCanvasElement, clientX: number, clientY: number) => Cell | null;
  onPaintCell: (cell: Cell) => void;
};

export function useCanvasPainting({ canvasRef, getCellFromPointer, onPaintCell }: UseCanvasPaintingParams) {
  const isPaintingRef = useRef(false);
  const [cursorCell, setCursorCell] = useState<Cell | null>(null);

  const updateCursor = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        setCursorCell(null);
        return null;
      }

      const cell = getCellFromPointer(canvas, event.clientX, event.clientY);
      setCursorCell(cell);
      return cell;
    },
    [canvasRef, getCellFromPointer]
  );

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
        onPaintCell(cell);
      }
    },
    [canvasRef, onPaintCell, updateCursor]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      const cell = updateCursor(event);
      if (!isPaintingRef.current || !cell) {
        return;
      }

      onPaintCell(cell);
    },
    [onPaintCell, updateCursor]
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
    [canvasRef, updateCursor]
  );

  const handlePointerLeave = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (canvas && canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }

      isPaintingRef.current = false;
      setCursorCell(null);
    },
    [canvasRef]
  );

  return {
    cursorCell,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave
  };
}
