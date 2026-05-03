import type { ProjectDocumentRecord } from './types';
import { deserializeStoredProjectDocument, serializeStoredProjectDocument } from './project-adapter';

export function serializeProjectDocument(document: ProjectDocumentRecord): string {
  return serializeStoredProjectDocument(document);
}

export function deserializeProjectDocument(raw: string): ProjectDocumentRecord {
  return deserializeStoredProjectDocument(raw);
}
