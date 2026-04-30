import type { PointerEventHandler, RefObject } from 'react';

type PixelCanvasProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  width: number;
  height: number;
  onPointerDown: PointerEventHandler<HTMLCanvasElement>;
  onPointerMove: PointerEventHandler<HTMLCanvasElement>;
  onPointerUp: PointerEventHandler<HTMLCanvasElement>;
};

export function PixelCanvas({
  canvasRef,
  width,
  height,
  onPointerDown,
  onPointerMove,
  onPointerUp
}: PixelCanvasProps) {
  return (
    <main className="workspace">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />
    </main>
  );
}
