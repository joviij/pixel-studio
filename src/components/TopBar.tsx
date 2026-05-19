import type { ProjectSummary } from '../../electron/types';
import { useCallback, useState } from 'react';
import { Icon } from './Icon';

type TopBarProps = {
  projectName: string;
  activeProjectId?: number;
  projects: ProjectSummary[];
  canSave: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onProjectNameChange: (name: string) => void;
  onNew: () => void;
  onClear: () => void;
  onLoad: (projectId?: number) => void | Promise<void>;
  onSave: () => void;
  onDelete: () => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
};

export function TopBar({
  projectName,
  activeProjectId,
  projects,
  canSave,
  canUndo,
  canRedo,
  onProjectNameChange,
  onNew,
  onClear,
  onLoad,
  onSave,
  onDelete,
  onExport,
  onUndo,
  onRedo
}: TopBarProps) {
  const [isProjectPickerOpen, setIsProjectPickerOpen] = useState(false);

  const openProjectPicker = useCallback(() => {
    setIsProjectPickerOpen(true);
  }, []);

  const closeProjectPicker = useCallback(() => {
    setIsProjectPickerOpen(false);
  }, []);

  const handleProjectOpen = useCallback(
    (projectId: number) => {
      void onLoad(projectId);
      closeProjectPicker();
    },
    [closeProjectPicker, onLoad]
  );

  return (
    <header className="top-bar">
      <div className="action-row">
        <div className="action-group">
          <button type="button" className="icon-button" onClick={onNew} title="New project">
            <Icon name="new" size={16} className="ui-icon" />
            <span>New</span>
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={openProjectPicker}
            title="Open project"
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
            title="Delete current project"
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
          <button type="button" className="icon-button" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl/Cmd+Z)">
            <Icon name="undo" size={16} className="ui-icon" />
            <span>Undo</span>
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y or Cmd/Ctrl+Shift+Z)"
          >
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
        </div>
      </div>
      {isProjectPickerOpen && (
        <div className="project-picker-overlay" onClick={closeProjectPicker}>
          <div
            className="project-picker-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-picker-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="project-picker-head">
              <h2 id="project-picker-title">Open Project</h2>
              <button type="button" className="icon-button mini" onClick={closeProjectPicker}>
                Close
              </button>
            </div>
            {projects.length === 0 ? (
              <p className="project-picker-empty">No saved projects yet.</p>
            ) : (
              <ul className="project-picker-list">
                {projects.map((project) => (
                  <li key={project.id}>
                    <button
                      type="button"
                      className="project-picker-item"
                      onClick={() => handleProjectOpen(project.id)}
                    >
                      <span>#{project.id}</span>
                      <span>{project.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
