import type { ProjectSummary } from '../../electron/types';
import type { Tool } from '../pixel-grid';

type ControlPanelProps = {
  projectName: string;
  activeProjectId?: number;
  projects: ProjectSummary[];
  tool: Tool;
  selectedColor: string;
  canSave: boolean;
  status: string;
  onProjectNameChange: (name: string) => void;
  onProjectSelectChange: (value: string) => void;
  onToolChange: (tool: Tool) => void;
  onColorChange: (color: string) => void;
  onClear: () => void;
  onSave: () => void;
  onLoad: () => void;
  onExport: () => void;
};

export function ControlPanel({
  projectName,
  activeProjectId,
  projects,
  tool,
  selectedColor,
  canSave,
  status,
  onProjectNameChange,
  onProjectSelectChange,
  onToolChange,
  onColorChange,
  onClear,
  onSave,
  onLoad,
  onExport
}: ControlPanelProps) {
  return (
    <aside className="panel">
      <h1>Pixel Studio MVP</h1>

      <label className="field" htmlFor="project-name">
        Project Name
      </label>
      <input
        id="project-name"
        value={projectName}
        onChange={(event) => onProjectNameChange(event.target.value)}
        placeholder="Untitled"
      />

      <label className="field" htmlFor="project-select">
        Saved Projects
      </label>
      <select
        id="project-select"
        value={activeProjectId ?? ''}
        onChange={(event) => onProjectSelectChange(event.target.value)}
      >
        <option value="">New Project</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            #{project.id} {project.name}
          </option>
        ))}
      </select>

      <div className="tool-row">
        <button className={tool === 'brush' ? 'active' : ''} type="button" onClick={() => onToolChange('brush')}>
          Brush
        </button>
        <button
          className={tool === 'eraser' ? 'active' : ''}
          type="button"
          onClick={() => onToolChange('eraser')}
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
        onChange={(event) => onColorChange(event.target.value)}
        disabled={tool === 'eraser'}
      />

      <div className="actions">
        <button type="button" onClick={onClear}>
          Clear Canvas
        </button>
        <button type="button" onClick={onSave} disabled={!canSave}>
          Save Project
        </button>
        <button type="button" onClick={onLoad} disabled={!activeProjectId}>
          Load Project
        </button>
        <button type="button" onClick={onExport}>
          Export PNG
        </button>
      </div>

      <p className="status">{status}</p>
    </aside>
  );
}
