import type { PointerEventHandler, Ref } from 'react';

type PixelCanvasProps = {
  canvasRef: Ref<HTMLCanvasElement>;
  width: number;
  height: number;
  onPointerDown: PointerEventHandler<HTMLCanvasElement>;
  onPointerMove: PointerEventHandler<HTMLCanvasElement>;
  onPointerUp: PointerEventHandler<HTMLCanvasElement>;
  onPointerLeave: PointerEventHandler<HTMLCanvasElement>;
};

export function PixelCanvas({
  canvasRef,
  width,
  height,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerLeave
}: PixelCanvasProps) {
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="pixel-canvas"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
    />
  );
}
