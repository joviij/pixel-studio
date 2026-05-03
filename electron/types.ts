export type PixelGrid = string[];

export type LayerRecord = {
  id: string;
  name: string;
  pixels: PixelGrid;
  visible: boolean;
  locked: boolean;
  opacity: number;
};

export type ProjectDocumentRecord = {
  version: 2;
  layers: LayerRecord[];
  activeLayerId: string;
};

export type ProjectRecord = {
  id: number;
  name: string;
  document: ProjectDocumentRecord;
  updatedAt: string;
};

export type ProjectSummary = {
  id: number;
  name: string;
  updatedAt: string;
};

export type SaveProjectInput = {
  id?: number;
  name: string;
  document: ProjectDocumentRecord;
};
