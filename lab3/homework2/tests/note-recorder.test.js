import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NoteRecorder } from '../src/audio/NoteRecorder.js';

function setup() {
  let time = 1000;
  return {
    recorder: new NoteRecorder(() => time),
    at(value) { time = value; },
  };
}

test('preserves onset order and initial silence when notes end in reverse order', () => {
  const { recorder, at } = setup();
  recorder.start();
  at(1100);
  recorder.noteOn(60, 261.625565);
  at(1300);
  recorder.noteOn(64, 329.627557);
  at(1400);
  recorder.noteOff(64);
  at(1600);
  recorder.noteOff(60);
  assert.deepEqual(recorder.stop(), [
    { midi: 60, freqHz: 261.625565, durationMs: 500, deltaMs: 100 },
    { midi: 64, freqHz: 329.627557, durationMs: 100, deltaMs: 200 },
  ]);
});

test('ignores duplicate note-on and supports another occurrence after release', () => {
  const { recorder, at } = setup();
  recorder.start();
  at(1010);
  recorder.noteOn(60, 261);
  at(1020);
  recorder.noteOn(60, 261);
  at(1030);
  recorder.noteOff(60);
  at(1050);
  recorder.noteOn(60, 261);
  at(1100);
  const notes = recorder.stop();
  assert.equal(notes.length, 2);
  assert.deepEqual(notes.map(({ durationMs, deltaMs }) => [durationMs, deltaMs]), [[20, 10], [50, 40]]);
});

test('stop finalizes every held note at the same timestamp and is idempotent', () => {
  const { recorder, at } = setup();
  recorder.start();
  recorder.noteOn(60, 261);
  at(1200);
  recorder.noteOn(64, 329);
  at(1500);
  const notes = recorder.stop();
  assert.deepEqual(notes.map((note) => note.durationMs), [500, 300]);
  assert.equal(recorder.activeNotes.size, 0);
  assert.equal(recorder.isRecording, false);
  at(1700);
  recorder.noteOff(60);
  recorder.noteOn(67, 392);
  assert.deepEqual(recorder.stop(), notes);
});

test('stop-all or focus loss closes held notes while allowing recording to continue', () => {
  const { recorder, at } = setup();
  recorder.start();
  recorder.noteOn(60, 261);
  at(1200);
  recorder.releaseAll();
  assert.equal(recorder.isRecording, true);
  at(1500);
  recorder.noteOn(64, 329);
  at(1600);
  const notes = recorder.stop();
  assert.deepEqual(notes.map(({ durationMs, deltaMs }) => [durationMs, deltaMs]), [[200, 0], [100, 500]]);
});

test('start replaces old data; clear is blocked during recording', () => {
  const { recorder, at } = setup();
  recorder.noteOn(60, 261);
  assert.deepEqual(recorder.snapshot(), []);
  recorder.start();
  recorder.noteOn(60, 261);
  assert.equal(recorder.clear(), false);
  assert.equal(recorder.snapshot().length, 1);
  at(2000);
  recorder.start();
  assert.deepEqual(recorder.snapshot(), []);
  assert.equal(recorder.activeNotes.size, 0);
  at(2050);
  recorder.noteOn(64, 329);
  assert.equal(recorder.stop()[0].deltaMs, 50);
  assert.equal(recorder.clear(), true);
  assert.deepEqual(recorder.snapshot(), []);
});

test('returned snapshots cannot mutate the internal recording', () => {
  const { recorder, at } = setup();
  recorder.start();
  recorder.noteOn(60, 261);
  const snapshot = recorder.snapshot();
  snapshot[0].midi = 99;
  at(1200);
  const stopped = recorder.stop();
  assert.equal(stopped[0].midi, 60);
  stopped[0].durationMs = 999;
  assert.equal(recorder.snapshot()[0].durationMs, 200);
});
