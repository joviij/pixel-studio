import { useCallback, useEffect, useState } from 'react';
import type { ProjectSummary } from '../../electron/types';
import { dataUrlToBytes } from '../png-export';
import { PIXEL_COUNT, createEmptyPixels, renderToExportCanvas } from '../pixel-grid';

type UseProjectActionsParams = {
  activeProjectId?: number;
  projectName: string;
  pixels: string[];
  canSave: boolean;
  setActiveProjectId: (id: number | undefined) => void;
  setProjectName: (name: string) => void;
  setPixels: (pixels: string[]) => void;
};

export function useProjectActions({
  activeProjectId,
  projectName,
  pixels,
  canSave,
  setActiveProjectId,
  setProjectName,
  setPixels
}: UseProjectActionsParams) {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [status, setStatus] = useState('Ready');

  const refreshProjects = useCallback(async () => {
    const items = await window.pixelStudio.listProjects();
    setProjects(items);
  }, []);

  useEffect(() => {
    refreshProjects().catch((error: unknown) => {
      setStatus(`Failed to load projects: ${String(error)}`);
    });
  }, [refreshProjects]);

  const handleClear = useCallback(() => {
    setPixels(createEmptyPixels());
    setStatus('Canvas cleared');
  }, [setPixels]);

  const handleNew = useCallback(() => {
    setPixels(createEmptyPixels());
    setActiveProjectId(undefined);
    setProjectName('Untitled');
    setStatus('New project');
  }, [setActiveProjectId, setPixels, setProjectName]);

  const handleSave = useCallback(async () => {
    if (!canSave) {
      setStatus('Name is required to save.');
      return;
    }

    try {
      const saved = await window.pixelStudio.saveProject({
        id: activeProjectId,
        name: projectName.trim(),
        pixels
      });

      setActiveProjectId(saved.id);
      setProjectName(saved.name);
      await refreshProjects();
      setStatus(`Saved project #${saved.id}`);
    } catch (error: unknown) {
      setStatus(`Save failed: ${String(error)}`);
    }
  }, [activeProjectId, canSave, pixels, projectName, refreshProjects, setActiveProjectId, setProjectName]);

  const handleLoad = useCallback(async (projectId?: number) => {
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

      const normalized = project.pixels.length === PIXEL_COUNT ? project.pixels : createEmptyPixels();
      setActiveProjectId(project.id);
      setPixels(normalized);
      setProjectName(project.name);
      setStatus(`Loaded project #${project.id}`);
    } catch (error: unknown) {
      setStatus(`Load failed: ${String(error)}`);
    }
  }, [activeProjectId, setActiveProjectId, setPixels, setProjectName]);

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
      setPixels(createEmptyPixels());
      await refreshProjects();
      setStatus(`Deleted project ${label}`);
    } catch (error: unknown) {
      setStatus(`Delete failed: ${String(error)}`);
    }
  }, [activeProjectId, projects, refreshProjects, setActiveProjectId, setPixels, setProjectName]);

  const handleExport = useCallback(async () => {
    try {
      const filePath = await window.pixelStudio.chooseExportPath();
      if (!filePath) {
        setStatus('Export canceled.');
        return;
      }

      const exportCanvas = renderToExportCanvas(pixels);
      const pngBytes = await dataUrlToBytes(exportCanvas.toDataURL('image/png'));
      await window.pixelStudio.writePng(filePath, pngBytes);
      setStatus(`Exported PNG to ${filePath}`);
    } catch (error: unknown) {
      setStatus(`Export failed: ${String(error)}`);
    }
  }, [pixels]);

  return {
    projects,
    status,
    handleNew,
    handleClear,
    handleSave,
    handleLoad,
    handleDelete,
    handleExport
  };
}
