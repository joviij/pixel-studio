import { describe, expect, it } from 'vitest';
import {
  EMPTY_COLOR,
  addLayer,
  createDefaultDocument,
  deleteLayer,
  moveLayer,
  paintDocumentCell,
  renameLayer,
  setActiveLayer,
  setLayerLock,
  setLayerVisibility
} from '../src/pixel-grid';

describe('layer document behavior', () => {
  it('does not delete the final remaining layer', () => {
    const initial = createDefaultDocument();
    const next = deleteLayer(initial, initial.activeLayerId);

    expect(next.layers).toHaveLength(1);
    expect(next.activeLayerId).toBe(initial.activeLayerId);
  });

  it('adds and reorders layers', () => {
    const withSecond = addLayer(createDefaultDocument());
    const activeBeforeMove = withSecond.activeLayerId;

    const movedDown = moveLayer(withSecond, activeBeforeMove, 'down');
    expect(movedDown.layers[0]?.id).toBe(activeBeforeMove);

    const movedUp = moveLayer(movedDown, activeBeforeMove, 'up');
    expect(movedUp.layers[1]?.id).toBe(activeBeforeMove);
  });

  it('blocks paint when active layer is hidden', () => {
    const initial = createDefaultDocument();
    const hidden = setLayerVisibility(initial, initial.activeLayerId, false);
    const painted = paintDocumentCell(hidden, { x: 1, y: 1 }, '#ff00ff');

    expect(painted.changed).toBe(false);
    expect(painted.reason).toBe('Active layer is hidden.');
  });

  it('blocks paint when active layer is locked', () => {
    const initial = createDefaultDocument();
    const locked = setLayerLock(initial, initial.activeLayerId, true);
    const painted = paintDocumentCell(locked, { x: 2, y: 2 }, '#00ffff');

    expect(painted.changed).toBe(false);
    expect(painted.reason).toBe('Active layer is locked.');
  });

  it('paints only the active layer', () => {
    const first = createDefaultDocument();
    const second = addLayer(first);

    const baseLayerId = second.layers[0]!.id;
    const activeLayerId = second.activeLayerId;

    const selectedBase = setActiveLayer(second, baseLayerId);
    const paintedBase = paintDocumentCell(selectedBase, { x: 0, y: 0 }, '#123456').document;
    const selectedTop = setActiveLayer(paintedBase, activeLayerId);
    const paintedTop = paintDocumentCell(selectedTop, { x: 0, y: 0 }, '#abcdef').document;

    expect(paintedTop.layers[0]?.pixels[0]).toBe('#123456');
    expect(paintedTop.layers[1]?.pixels[0]).toBe('#abcdef');
  });

  it('renames with trimmed names and ignores empty rename', () => {
    const initial = createDefaultDocument();
    const renamed = renameLayer(initial, initial.activeLayerId, '  Lines  ');
    const ignored = renameLayer(renamed, renamed.activeLayerId, '   ');

    expect(renamed.layers[0]?.name).toBe('Lines');
    expect(ignored.layers[0]?.name).toBe('Lines');
  });

  it('eraser color can be applied via transparent paint', () => {
    const initial = createDefaultDocument();
    const painted = paintDocumentCell(initial, { x: 3, y: 3 }, '#334455').document;
    const erased = paintDocumentCell(painted, { x: 3, y: 3 }, EMPTY_COLOR).document;

    expect(erased.layers[0]?.pixels[3 + 3 * 32]).toBe(EMPTY_COLOR);
  });
});
