import { describe, expect, it } from 'vitest';
import {
  commitHistory,
  createHistoryState,
  redoHistory,
  replaceHistoryPresent,
  resetHistory,
  undoHistory
} from '../src/history';

describe('history state', () => {
  it('tracks commits and allows undo/redo', () => {
    const initial = createHistoryState('a');
    const withB = commitHistory(initial, 'b');
    const withC = commitHistory(withB, 'c');

    expect(withC.past).toEqual(['a', 'b']);
    expect(withC.present).toBe('c');
    expect(withC.future).toEqual([]);

    const undone = undoHistory(withC);
    expect(undone.present).toBe('b');
    expect(undone.future).toEqual(['c']);

    const redone = redoHistory(undone);
    expect(redone.present).toBe('c');
    expect(redone.future).toEqual([]);
  });

  it('clears future entries when a new commit is made', () => {
    const initial = createHistoryState(1);
    const withTwo = commitHistory(initial, 2);
    const withThree = commitHistory(withTwo, 3);
    const undone = undoHistory(withThree);

    const branched = commitHistory(undone, 99);

    expect(branched.present).toBe(99);
    expect(branched.past).toEqual([1, 2]);
    expect(branched.future).toEqual([]);
  });

  it('supports replace and reset modes', () => {
    const initial = createHistoryState('base');
    const withChange = commitHistory(initial, 'change');

    const replaced = replaceHistoryPresent(withChange, 'saved');
    expect(replaced.past).toEqual(['base']);
    expect(replaced.present).toBe('saved');

    const reset = resetHistory('loaded');
    expect(reset.past).toEqual([]);
    expect(reset.present).toBe('loaded');
    expect(reset.future).toEqual([]);
  });

  it('enforces max history length', () => {
    let history = createHistoryState(0);
    history = commitHistory(history, 1, 2);
    history = commitHistory(history, 2, 2);
    history = commitHistory(history, 3, 2);

    expect(history.past).toEqual([1, 2]);
    expect(history.present).toBe(3);
  });
});
