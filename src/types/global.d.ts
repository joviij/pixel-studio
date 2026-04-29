import type { ProjectRecord, ProjectSummary, SaveProjectInput } from '../../electron/types';

declare global {
  interface Window {
    pixelStudio: {
      listProjects: () => Promise<ProjectSummary[]>;
      getProject: (id: number) => Promise<ProjectRecord | null>;
      saveProject: (input: SaveProjectInput) => Promise<ProjectRecord>;
      chooseExportPath: () => Promise<string | null>;
      writePng: (filePath: string, bytes: Uint8Array) => Promise<boolean>;
    };
  }
}

export {};
