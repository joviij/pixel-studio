import type { ProjectSummary } from '../../electron/types';
import { Icon } from './Icon';

type TopBarProps = {
  projectName: string;
  activeProjectId?: number;
  projects: ProjectSummary[];
  canSave: boolean;
  onProjectNameChange: (name: string) => void;
  onProjectSelectChange: (value: string) => void;
  onNew: () => void;
  onClear: () => void;
  onLoad: () => void;
  onSave: () => void;
  onDelete: () => void;
  onExport: () => void;
};

export function TopBar({
  projectName,
  activeProjectId,
  projects,
  canSave,
  onProjectNameChange,
  onProjectSelectChange,
  onNew,
  onClear,
  onLoad,
  onSave,
  onDelete,
  onExport
}: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="menu-row" role="menubar" aria-label="Application menu">
        <button type="button" className="menu-button" title="File menu">
          File
        </button>
        <button type="button" className="menu-button" title="Edit menu">
          Edit
        </button>
        <button type="button" className="menu-button" title="View menu">
          View
        </button>
        <button type="button" className="menu-button" title="Image menu">
          Image
        </button>
        <button type="button" className="menu-button" title="Help menu">
          Help
        </button>
      </div>

      <div className="action-row">
        <div className="action-group">
          <button type="button" className="icon-button" onClick={onNew} title="New project">
            <Icon name="new" size={16} className="ui-icon" />
            <span>New</span>
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={onLoad}
            disabled={!activeProjectId}
            title="Load selected project"
          >
            <Icon name="open" size={16} className="ui-icon" />
            <span>Open</span>
          </button>
          <button type="button" className="icon-button" onClick={onSave} disabled={!canSave} title="Save project">
            <Icon name="save" size={16} className="ui-icon" />
            <span>Save</span>
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={onDelete}
            disabled={!activeProjectId}
            title="Delete selected project"
          >
            <span>Delete</span>
          </button>
          <button type="button" className="icon-button" onClick={onExport} title="Export PNG">
            <Icon name="export" size={16} className="ui-icon" />
            <span>Export</span>
          </button>
          <button type="button" className="icon-button" onClick={onClear} title="Clear canvas">
            <Icon name="eraser" size={16} className="ui-icon" />
            <span>Clear</span>
          </button>
        </div>

        <div className="action-group">
          <button type="button" className="icon-button" disabled title="Undo (not available in MVP)">
            <Icon name="undo" size={16} className="ui-icon" />
            <span>Undo</span>
          </button>
          <button type="button" className="icon-button" disabled title="Redo (not available in MVP)">
            <Icon name="redo" size={16} className="ui-icon" />
            <span>Redo</span>
          </button>
        </div>

        <div className="action-group">
          <button type="button" className="icon-button" disabled title="Zoom out (placeholder)">
            <Icon name="zoom-out" size={16} className="ui-icon" />
          </button>
          <button type="button" className="icon-button" disabled title="Current zoom">
            16x
          </button>
          <button type="button" className="icon-button" disabled title="Zoom in (placeholder)">
            <Icon name="zoom-in" size={16} className="ui-icon" />
          </button>
          <button type="button" className="icon-button" disabled title="Fit to view (placeholder)">
            <Icon name="fit" size={16} className="ui-icon" />
          </button>
        </div>

        <div className="project-controls">
          <input
            id="project-name"
            value={projectName}
            onChange={(event) => onProjectNameChange(event.target.value)}
            placeholder="Project name"
            aria-label="Project name"
          />
          <select
            id="project-select"
            value={activeProjectId ?? ''}
            onChange={(event) => onProjectSelectChange(event.target.value)}
            aria-label="Saved projects"
          >
            <option value="">New Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                #{project.id} {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
