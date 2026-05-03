import { useCallback, useEffect, useState } from 'react';
import {
  commitHistory,
  createHistoryState,
  redoHistory,
  replaceHistoryPresent,
  resetHistory,
  undoHistory
} from '../history';
import type { ProjectDocument } from '../pixel-grid';

export type DocumentUpdateMode = 'commit' | 'replace' | 'reset';

export type DocumentUpdateOptions = {
  mode?: DocumentUpdateMode;
};

type UseEditorDocumentParams = {
  createInitialDocument: () => ProjectDocument;
  setStatus: (status: string) => void;
};

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  );
}

export function useEditorDocument({ createInitialDocument, setStatus }: UseEditorDocumentParams) {
  const [projectHistory, setProjectHistory] = useState(() => createHistoryState(createInitialDocument()));

  const projectDocument = projectHistory.present;
  const canUndo = projectHistory.past.length > 0;
  const canRedo = projectHistory.future.length > 0;

  const setProjectDocument = useCallback((document: ProjectDocument, options?: DocumentUpdateOptions) => {
    setProjectHistory((previousHistory) => {
      const mode = options?.mode ?? 'commit';
      if (mode === 'reset') {
        return resetHistory(document);
      }

      if (mode === 'replace') {
        return replaceHistoryPresent(previousHistory, document);
      }

      return commitHistory(previousHistory, document);
    });
  }, []);

  const applyProjectDocumentChange = useCallback(
    (updater: (previousDocument: ProjectDocument) => ProjectDocument, options?: DocumentUpdateOptions) => {
      setProjectHistory((previousHistory) => {
        const nextDocument = updater(previousHistory.present);
        const mode = options?.mode ?? 'commit';
        if (mode === 'reset') {
          return resetHistory(nextDocument);
        }

        if (mode === 'replace') {
          return replaceHistoryPresent(previousHistory, nextDocument);
        }

        return commitHistory(previousHistory, nextDocument);
      });
    },
    []
  );

  const undo = useCallback(() => {
    if (!canUndo) {
      setStatus('Nothing to undo.');
      return;
    }

    setProjectHistory((previousHistory) => undoHistory(previousHistory));
    setStatus('Undo');
  }, [canUndo, setStatus]);

  const redo = useCallback(() => {
    if (!canRedo) {
      setStatus('Nothing to redo.');
      return;
    }

    setProjectHistory((previousHistory) => redoHistory(previousHistory));
    setStatus('Redo');
  }, [canRedo, setStatus]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableElement(event.target)) {
        return;
      }

      const isPrimaryModifier = event.ctrlKey || event.metaKey;
      if (!isPrimaryModifier) {
        return;
      }

      const key = event.key.toLowerCase();
      const shouldUndo = key === 'z' && !event.shiftKey;
      const shouldRedo = key === 'y' || (key === 'z' && event.shiftKey);

      if (shouldUndo) {
        event.preventDefault();
        undo();
        return;
      }

      if (shouldRedo) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [redo, undo]);

  return {
    projectDocument,
    canUndo,
    canRedo,
    setProjectDocument,
    applyProjectDocumentChange,
    undo,
    redo
  };
}
