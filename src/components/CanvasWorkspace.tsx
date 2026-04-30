import type { ReactNode } from 'react';

type CanvasWorkspaceProps = {
  children: ReactNode;
};

export function CanvasWorkspace({ children }: CanvasWorkspaceProps) {
  return (
    <section className="canvas-workspace" aria-label="Canvas workspace">
      <div className="canvas-stage">{children}</div>
    </section>
  );
}
