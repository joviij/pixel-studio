export type PixelGrid = string[];

export type ProjectRecord = {
  id: number;
  name: string;
  pixels: PixelGrid;
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
  pixels: PixelGrid;
};
