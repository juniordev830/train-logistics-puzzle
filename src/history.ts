/**
 * Framework-independent timeline for reversible puzzle moves.
 * The returned history is immutable; snapshots should be immutable board arrays.
 */
export type History<T> = Readonly<{
  present: T;
  past: readonly T[];
  future: readonly T[];
  limit: number;
}>;

function requireLimit(limit: number): void {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000) {
    throw new RangeError('History limit must be an integer between 1 and 1000');
  }
}

export function createHistory<T>(initial: T, limit = 100): History<T> {
  requireLimit(limit);
  return { present: initial, past: [], future: [], limit };
}

export function pushHistory<T>(history: History<T>, next: T): History<T> {
  if (Object.is(next, history.present)) return history;
  const past = [...history.past, history.present].slice(-history.limit);
  return { ...history, present: next, past, future: [] };
}

export function undoHistory<T>(history: History<T>): History<T> {
  if (history.past.length === 0) return history;
  const present = history.past[history.past.length - 1];
  return {
    ...history,
    present,
    past: history.past.slice(0, -1),
    future: [history.present, ...history.future]
  };
}

export function redoHistory<T>(history: History<T>): History<T> {
  if (history.future.length === 0) return history;
  return {
    ...history,
    present: history.future[0],
    past: [...history.past, history.present].slice(-history.limit),
    future: history.future.slice(1)
  };
}

export function canUndo<T>(history: History<T>): boolean {
  return history.past.length > 0;
}

export function canRedo<T>(history: History<T>): boolean {
  return history.future.length > 0;
}
