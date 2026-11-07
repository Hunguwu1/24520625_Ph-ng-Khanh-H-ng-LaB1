import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { PolyphonicSynth } from '../src/audio/PolyphonicSynth.js';
import { NoteRecorder } from '../src/audio/NoteRecorder.js';

const originalContext = globalThis.AudioContext;

class FakeAudioContext {
  constructor() {
    this.currentTime = 1;
    this.state = 'running';
    this.destination = {};
  }

  createOscillator() {
    return {
      frequency: { setValueAtTime() {} },
      connect() {},
      disconnect() { this.disconnected = true; },
      start() {},
      stop(time) { this.stopTime = time ?? 0; },
    };
  }

  createGain() {
    return {
      gain: {
        setValueAtTime() {},
        cancelAndHoldAtTime() {},
        exponentialRampToValueAtTime() {},
      },
      connect() {},
      disconnect() {},
    };
  }

  close() {
    this.state = 'closed';
    return Promise.resolve();
  }
}

globalThis.AudioContext = FakeAudioContext;
after(() => {
  if (originalContext === undefined) delete globalThis.AudioContext;
  else globalThis.AudioContext = originalContext;
});

function play(synth, midi) {
  return synth.noteOn(midi, 440 * 2 ** ((midi - 69) / 12));
}

test('ninth and tenth notes replace the oldest active notes in FIFO order', () => {
  const synth = new PolyphonicSynth();
  for (let midi = 60; midi < 68; midi++) {
    assert.equal(play(synth, midi).stolenMidi, null);
  }
  const first = synth.voices.get(60);
  assert.equal(play(synth, 68).stolenMidi, 60);
  assert.equal(first.osc.stopTime, 1.04);
  assert.equal(play(synth, 69).stolenMidi, 61);
  assert.deepEqual([...synth.voices.keys()], [62, 63, 64, 65, 66, 67, 68, 69]);
  synth.noteOff(60);
  assert.equal(synth.voices.size, 8);
  synth.dispose();
});

test('duplicate notes preserve FIFO order; released notes free their slots', async () => {
  const synth = new PolyphonicSynth(2);
  play(synth, 60);
  play(synth, 62);
  const duplicate = play(synth, 60);
  assert.equal(duplicate.stolenMidi, null);
  await duplicate.resumed;
  assert.equal(play(synth, 64).stolenMidi, 60);
  synth.noteOff(62);
  assert.equal(play(synth, 65).stolenMidi, null);
  assert.deepEqual([...synth.voices.keys()], [64, 65]);
  synth.dispose();
});

test('old release callbacks cannot remove a new voice of the same pitch', () => {
  const synth = new PolyphonicSynth(1);
  play(synth, 60);
  const old = synth.voices.get(60);
  play(synth, 62);
  play(synth, 60);
  const replacement = synth.voices.get(60);
  old.osc.onended();
  assert.equal(synth.voices.get(60), replacement);
  synth.stopAll();
  assert.equal(synth.voices.size, 0);
  assert.equal(synth.allVoices.size, 0);
  assert.equal(replacement.osc.disconnected, true);
  synth.dispose();
  synth.dispose();
  assert.equal(synth.ctx.state, 'closed');
});

test('invalid voice limits are rejected', () => {
  for (const limit of [0, -1, 1.5, NaN]) {
    assert.throws(() => new PolyphonicSynth(limit), RangeError);
  }
});

test('recording closes FIFO-stolen notes and ignores their later release', () => {
  let time = 0;
  const recorder = new NoteRecorder(() => time);
  const synth = new PolyphonicSynth();
  recorder.start();
  for (let midi = 60; midi <= 68; midi++) {
    time = (midi - 60) * 100;
    const { stolenMidi } = play(synth, midi);
    if (stolenMidi !== null) recorder.noteOff(stolenMidi);
    recorder.noteOn(midi, 440 * 2 ** ((midi - 69) / 12));
  }
  time = 900;
  synth.noteOff(60);
  recorder.noteOff(60);
  assert.equal(synth.voices.size, 8);
  assert.equal(recorder.snapshot()[0].durationMs, 800);
  const notes = recorder.stop();
  assert.equal(notes.length, 9);
  assert.equal(notes.at(-1).durationMs, 100);
  assert.equal(notes.at(-1).deltaMs, 100);
  synth.dispose();
});
