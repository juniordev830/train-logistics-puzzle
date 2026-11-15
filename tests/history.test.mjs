import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createHistory, pushHistory, undoHistory, redoHistory, undoSteps, redoSteps, canUndo, canRedo
} from '../dist/history.js';

test('rotations can be undone and redone in exact chronological order', () => {
  let h = createHistory(['start', 'straight', 'end']);
  const rotated = ['start', 'horizontal', 'end'];
  h = pushHistory(h, rotated);
  h = pushHistory(h, ['start', 'vertical', 'end']);
  assert.equal(canUndo(h), true);
  h = undoHistory(h);
  assert.deepEqual(h.present, rotated);
  assert.equal(canRedo(h), true);
  h = undoHistory(h);
  assert.deepEqual(h.present, ['start', 'straight', 'end']);
  assert.equal(canUndo(h), false);
  h = redoHistory(h);
  h = redoHistory(h);
  assert.deepEqual(h.present, ['start', 'vertical', 'end']);
  assert.equal(canRedo(h), false);
});

test('fresh rotation after undo discards old redo branch', () => {
  let h = createHistory(0);
  h = pushHistory(h, 1);
  h = pushHistory(h, 2);
  h = undoHistory(h);
  assert.equal(h.present, 1);
  h = pushHistory(h, 99);
  assert.equal(canRedo(h), false);
  assert.equal(redoHistory(h), h);
  assert.equal(undoHistory(h).present, 1);
});

test('history is bounded at configured limit', () => {
  let h = createHistory(0, 3);
  for (let i = 1; i <= 12; i += 1) h = pushHistory(h, i);
  assert.equal(h.past.length, 3);
  assert.equal(h.present, 12);
  assert.equal(undoHistory(undoHistory(undoHistory(h))).present, 9);
});

test('no-op transitions preserve identity and clear nothing', () => {
  let h = createHistory(0);
  assert.equal(undoHistory(h), h);
  assert.equal(redoHistory(h), h);
  assert.equal(pushHistory(h, 0), h);
  h = pushHistory(h, 1);
  h = undoHistory(h);
  assert.equal(pushHistory(h, 0), h);
  assert.equal(canRedo(h), true);
});

test('previous timelines are not mutated by subsequent changes', () => {
  const first = createHistory(0);
  const second = pushHistory(first, 1);
  const third = pushHistory(second, 2);
  const rewind = undoHistory(third);
  assert.deepEqual(first, { present: 0, past: [], future: [], limit: 100 });
  assert.deepEqual(second, { present: 1, past: [0], future: [], limit: 100 });
  assert.deepEqual(rewind, { present: 1, past: [0], future: [2], limit: 100 });
});

test('invalid limits are refused', () => {
  for (const limit of [0, -1, Infinity, NaN, 1.5, 1001]) {
    assert.throws(() => createHistory(0, limit), RangeError);
  }
});

test('multi-step navigation clamps to available history and preserves past snapshots', () => {
  const initial = createHistory(0);
  let h = initial;
  for (let i = 1; i <= 7; i += 1) h = pushHistory(h, i);
  const paused = undoSteps(h, 5);
  assert.equal(paused.present, 2);
  assert.equal(paused.future.length, 5);
  assert.equal(redoSteps(paused, 3).present, 5);
  assert.equal(redoSteps(paused, 100).present, 7);
  assert.equal(undoSteps(h, 100).present, 0);
  assert.equal(undoSteps(h, 0), h);
  assert.equal(redoSteps(h, 0), h);
  assert.equal(initial.present, 0);
});

test('multi-step navigation rejects invalid counts', () => {
  const h = createHistory(0);
  for (const bad of [-1, 1.5, Infinity, NaN, 1001]) {
    assert.throws(() => undoSteps(h, bad), RangeError);
    assert.throws(() => redoSteps(h, bad), RangeError);
  }
});
