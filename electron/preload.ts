import { contextBridge, ipcRenderer } from 'electron';
import type { ProjectRecord, ProjectSummary, SaveProjectInput } from './types';

const api = {
  listProjects: (): Promise<ProjectSummary[]> => ipcRenderer.invoke('projects:list'),
  getProject: (id: number): Promise<ProjectRecord | null> => ipcRenderer.invoke('projects:get', id),
  saveProject: (input: SaveProjectInput): Promise<ProjectRecord> => ipcRenderer.invoke('projects:save', input),
  chooseExportPath: (): Promise<string | null> => ipcRenderer.invoke('dialog:savePng'),
  writePng: (filePath: string, bytes: Uint8Array): Promise<boolean> =>
    ipcRenderer.invoke('files:writePng', filePath, bytes)
};

contextBridge.exposeInMainWorld('pixelStudio', api);
