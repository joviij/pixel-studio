export type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

const DEFAULT_MAX_HISTORY = 200;

export function createHistoryState<T>(initial: T): HistoryState<T> {
  return {
    past: [],
    present: initial,
    future: []
  };
}

function trimPast<T>(past: T[], maxHistory: number): T[] {
  if (past.length <= maxHistory) {
    return past;
  }

  return past.slice(past.length - maxHistory);
}

export function commitHistory<T>(
  history: HistoryState<T>,
  next: T,
  maxHistory = DEFAULT_MAX_HISTORY
): HistoryState<T> {
  if (Object.is(history.present, next)) {
    return history;
  }

  return {
    past: trimPast([...history.past, history.present], maxHistory),
    present: next,
    future: []
  };
}

export function replaceHistoryPresent<T>(history: HistoryState<T>, next: T): HistoryState<T> {
  if (Object.is(history.present, next)) {
    return history;
  }

  return {
    ...history,
    present: next
  };
}

export function resetHistory<T>(next: T): HistoryState<T> {
  return {
    past: [],
    present: next,
    future: []
  };
}

export function undoHistory<T>(history: HistoryState<T>): HistoryState<T> {
  if (history.past.length === 0) {
    return history;
  }

  const nextPast = history.past.slice(0, -1);
  const previous = history.past[history.past.length - 1];
  if (typeof previous === 'undefined') {
    return history;
  }

  return {
    past: nextPast,
    present: previous,
    future: [history.present, ...history.future]
  };
}

export function redoHistory<T>(history: HistoryState<T>, maxHistory = DEFAULT_MAX_HISTORY): HistoryState<T> {
  const [nextPresent, ...restFuture] = history.future;
  if (typeof nextPresent === 'undefined') {
    return history;
  }

  return {
    past: trimPast([...history.past, history.present], maxHistory),
    present: nextPresent,
    future: restFuture
  };
}
