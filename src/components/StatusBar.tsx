import type { Cell, Tool } from '../pixel-grid';

type StatusBarProps = {
  cursorCell: Cell | null;
  tool: Tool;
  status: string;
  gridSize: number;
};

function formatToolName(tool: Tool): string {
  return tool.charAt(0).toUpperCase() + tool.slice(1);
}

export function StatusBar({ cursorCell, tool, status, gridSize }: StatusBarProps) {
  return (
    <footer className="status-bar">
      <span>{cursorCell ? `X: ${cursorCell.x}, Y: ${cursorCell.y}` : 'X: -, Y: -'}</span>
      <span>
        {gridSize} x {gridSize}
      </span>
      <span>{formatToolName(tool)}</span>
      <span className="status-message">{status}</span>
    </footer>
  );
}
