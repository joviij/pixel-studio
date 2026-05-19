import { Icon, type IconName } from './Icon';
import type { Tool } from '../pixel-grid';

type ToolsBarProps = {
  tool: Tool;
  onToolChange: (tool: Tool) => void;
};

type ToolItem = {
  id: string;
  label: string;
  title: string;
  disabled?: boolean;
  value?: Tool;
  icon?: IconName;
};

const TOOL_ITEMS: ToolItem[] = [
  { id: 'brush', label: 'Brush', title: 'Brush tool', value: 'brush', icon: 'brush' },
  { id: 'eraser', label: 'Eraser', title: 'Eraser tool', value: 'eraser', icon: 'eraser' },
  { id: 'fill', label: 'Fill', title: 'Fill tool (MVP placeholder)', disabled: true, icon: 'fill' },
  { id: 'eyedropper', label: 'Eyedropper', title: 'Eyedropper tool', value: 'eyedropper', icon: 'eyedropper' },
  { id: 'line', label: 'Ln', title: 'Line tool (MVP placeholder)', disabled: true },
  { id: 'select', label: 'Se', title: 'Select tool (MVP placeholder)', disabled: true },
  { id: 'move', label: 'Mv', title: 'Move tool (MVP placeholder)', disabled: true },
  { id: 'zoom', label: 'Zoom', title: 'Zoom tool (MVP placeholder)', disabled: true, icon: 'zoom-in' }
];

export function ToolsBar({ tool, onToolChange }: ToolsBarProps) {
  return (
    <section className="panel tools-panel" aria-label="Tools">
      <h2 className="panel-title">Tools</h2>
      <div className="tool-stack">
        {TOOL_ITEMS.map((item) => {
          const isActive = !item.disabled && item.value === tool;
          return (
            <button
              key={item.id}
              type="button"
              className={`tool-button${isActive ? ' active' : ''}`}
              onClick={() => {
                if (item.value) {
                  onToolChange(item.value);
                }
              }}
              title={item.title}
              disabled={item.disabled}
              aria-label={item.label}
            >
              {item.icon ? <Icon name={item.icon} size={16} className="ui-icon" /> : <span>{item.label}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
