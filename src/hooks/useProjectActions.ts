import { useCallback, useEffect, useState } from 'react';
import type { ProjectSummary } from '../../electron/types';
import { dataUrlToBytes } from '../png-export';
import type { DocumentUpdateOptions } from './useEditorDocument';
import {
  createDefaultDocument,
  renderDocumentToExportCanvas,
  type ProjectDocument
} from '../pixel-grid';

type UseProjectActionsParams = {
  activeProjectId?: number;
  projectName: string;
  projectDocument: ProjectDocument;
  canSave: boolean;
  setStatus: (status: string) => void;
  setActiveProjectId: (id: number | undefined) => void;
  setProjectName: (name: string) => void;
  setProjectDocument: (document: ProjectDocument, options?: DocumentUpdateOptions) => void;
};

export function useProjectActions({
  activeProjectId,
  projectName,
  projectDocument,
  canSave,
  setStatus,
  setActiveProjectId,
  setProjectName,
  setProjectDocument
}: UseProjectActionsParams) {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);

  const refreshProjects = useCallback(async () => {
    const items = await window.pixelStudio.listProjects();
    setProjects(items);
  }, []);

  useEffect(() => {
    refreshProjects().catch((error: unknown) => {
      setStatus(`Failed to load projects: ${String(error)}`);
    });
  }, [refreshProjects, setStatus]);

  const handleClear = useCallback(() => {
    // Clear should be undoable from the current working state.
    setProjectDocument(createDefaultDocument(), { mode: 'commit' });
    setStatus('Canvas cleared');
  }, [setProjectDocument, setStatus]);

  const handleNew = useCallback(() => {
    // New project starts a fresh timeline.
    setProjectDocument(createDefaultDocument(), { mode: 'reset' });
    setActiveProjectId(undefined);
    setProjectName('Untitled');
    setStatus('New project');
  }, [setActiveProjectId, setProjectDocument, setProjectName, setStatus]);

  const handleSave = useCallback(async () => {
    if (!canSave) {
      setStatus('Name is required to save.');
      return;
    }

    try {
      const saved = await window.pixelStudio.saveProject({
        id: activeProjectId,
        name: projectName.trim(),
        document: projectDocument
      });

      setActiveProjectId(saved.id);
      setProjectName(saved.name);
      // Replace current present snapshot without adding an extra undo step.
      setProjectDocument(saved.document, { mode: 'replace' });
      await refreshProjects();
      setStatus(`Saved project #${saved.id}`);
    } catch (error: unknown) {
      setStatus(`Save failed: ${String(error)}`);
    }
  }, [
    activeProjectId,
    canSave,
    projectDocument,
    projectName,
    refreshProjects,
    setActiveProjectId,
    setProjectDocument,
    setProjectName,
    setStatus
  ]);

  const handleLoad = useCallback(
    async (projectId?: number) => {
      const idToLoad = projectId ?? activeProjectId;
      if (!idToLoad) {
        setStatus('Choose a project to load.');
        return;
      }

      try {
        const project = await window.pixelStudio.getProject(idToLoad);
        if (!project) {
          setStatus('Project was not found.');
          return;
        }

        setActiveProjectId(project.id);
        // Loading a project should reset undo/redo to that loaded state.
        setProjectDocument(project.document, { mode: 'reset' });
        setProjectName(project.name);
        setStatus(`Loaded project #${project.id}`);
      } catch (error: unknown) {
        setStatus(`Load failed: ${String(error)}`);
      }
    },
    [activeProjectId, setActiveProjectId, setProjectDocument, setProjectName, setStatus]
  );

  const handleDelete = useCallback(async () => {
    if (!activeProjectId) {
      setStatus('Load a project before deleting.');
      return;
    }

    const target = projects.find((project) => project.id === activeProjectId);
    const label = target ? `#${target.id} "${target.name}"` : `#${activeProjectId}`;
    const confirmed = window.confirm(`Delete project ${label}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      const deleted = await window.pixelStudio.deleteProject(activeProjectId);
      if (!deleted) {
        setStatus('Project was not found.');
        return;
      }

      setActiveProjectId(undefined);
      setProjectName('Untitled');
      // After deletion we start a fresh untitled document timeline.
      setProjectDocument(createDefaultDocument(), { mode: 'reset' });
      await refreshProjects();
      setStatus(`Deleted project ${label}`);
    } catch (error: unknown) {
      setStatus(`Delete failed: ${String(error)}`);
    }
  }, [activeProjectId, projects, refreshProjects, setActiveProjectId, setProjectDocument, setProjectName, setStatus]);

  const handleExport = useCallback(async () => {
    try {
      const filePath = await window.pixelStudio.chooseExportPath();
      if (!filePath) {
        setStatus('Export canceled.');
        return;
      }

      const exportCanvas = renderDocumentToExportCanvas(projectDocument);
      const pngBytes = await dataUrlToBytes(exportCanvas.toDataURL('image/png'));
      await window.pixelStudio.writePng(filePath, pngBytes);
      setStatus(`Exported PNG to ${filePath}`);
    } catch (error: unknown) {
      setStatus(`Export failed: ${String(error)}`);
    }
  }, [projectDocument, setStatus]);

  return {
    projects,
    handleNew,
    handleClear,
    handleSave,
    handleLoad,
    handleDelete,
    handleExport
  };
}
