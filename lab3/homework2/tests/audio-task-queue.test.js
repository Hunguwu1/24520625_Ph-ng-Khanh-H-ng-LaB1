import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AudioTaskQueue } from '../src/audio/AudioTaskQueue.js';

async function flush() {
  for (let i = 0; i < 20; i++) await Promise.resolve();
}

function setup(limit = 8) {
  let now = 0;
  let nextId = 0;
  const timers = new Map();
  const log = [];
  const frames = [];
  const synth = {
    voices: new Map(),
    prepare: () => Promise.resolve(),
    noteOn(midi) {
      let stolenMidi = null;
      if (this.voices.size >= limit) {
        stolenMidi = this.voices.keys().next().value;
        this.noteOff(stolenMidi);
      }
      this.voices.set(midi, true);
      log.push(['on', midi, now]);
      return { stolenMidi, resumed: Promise.resolve() };
    },
    noteOff(midi) {
      if (this.voices.delete(midi)) log.push(['off', midi, now]);
    },
    stopAll() { this.voices.clear(); },
  };
  const queue = new AudioTaskQueue(synth, (keys) => frames.push([...keys]), {
    now: () => now,
    setTimeout(fn, delay) {
      const id = ++nextId;
      timers.set(id, { fn, at: now + delay });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
  });
  return {
    queue, synth, log, frames, timers,
    async fireLate(target) {
      await flush();
      now = target;
      const next = [...timers.entries()].sort((a, b) => a[1].at - b[1].at)[0];
      assert.ok(next && next[1].at <= target);
      timers.delete(next[0]);
      next[1].fn();
      await flush();
    },
    async advance(target) {
      await flush();
      while (true) {
        const next = [...timers.entries()].sort((a, b) => a[1].at - b[1].at)[0];
        if (!next || next[1].at > target) break;
        now = next[1].at;
        timers.delete(next[0]);
        next[1].fn();
        await flush();
      }
      now = target;
      await flush();
    },
  };
}

const note = (midi, deltaMs, durationMs) => ({ midi, freqHz: 440, deltaMs, durationMs });

for (const speed of [0.5, 1, 2]) {
  test(`speed ${speed}: initial silence, overlapping notes and longest end time`, async () => {
    const { queue, log, frames, advance, timers } = setup();
    const notes = [note(60, 100, 500), note(64, 200, 100)];
    const original = structuredClone(notes);
    const playing = queue.play(notes, speed);
    await advance(99 / speed);
    assert.deepEqual(log, []);
    await advance(300 / speed);
    assert.ok(frames.some((keys) => keys.includes(60) && keys.includes(64)));
    await advance(600 / speed);
    assert.equal(queue.isPlaying, true, 'wait for release tail before completion');
    await advance(600 / speed + 40);
    assert.deepEqual(await playing, { cancelled: false });
    assert.deepEqual(log, [
      ['on', 60, 100 / speed], ['on', 64, 300 / speed],
      ['off', 64, 400 / speed], ['off', 60, 600 / speed],
    ]);
    assert.equal(queue.isPlaying, false);
    assert.equal(timers.size, 0);
    assert.deepEqual(notes, original);
  });
}

test('Stop cancels a pending timer, settles the Promise and prevents later notes', async () => {
  const { queue, synth, log, timers, advance } = setup();
  const playing = queue.play([note(60, 0, 1000), note(64, 500, 100)]);
  await advance(100);
  queue.stop();
  assert.deepEqual(await playing, { cancelled: true });
  assert.equal(timers.size, 0);
  assert.equal(synth.voices.size, 0);
  await advance(2000);
  assert.deepEqual(log, [['on', 60, 0]]);
});

test('a late timer does not shift the remaining events away from the common clock', async () => {
  const { queue, log, advance, fireLate } = setup();
  const playing = queue.play([note(60, 100, 50), note(64, 200, 50)]);
  await fireLate(150);
  await advance(390);
  await playing;
  assert.deepEqual(log, [
    ['on', 60, 150], ['off', 60, 150], ['on', 64, 300], ['off', 64, 350],
  ]);
});

test('Stop during audio preparation settles without waiting for resume', async () => {
  const { queue, synth, log, advance } = setup();
  let resume;
  synth.prepare = () => new Promise((resolve) => { resume = resolve; });
  const playing = queue.play([note(60, 0, 100)]);
  queue.stop();
  assert.deepEqual(await playing, { cancelled: true });
  resume();
  await advance(1000);
  assert.deepEqual(log, []);
});

test('restarting cancels the old run without its cleanup stopping the new one', async () => {
  const { queue, synth, advance } = setup();
  const old = queue.play([note(60, 0, 1000)]);
  await advance(0);
  const next = queue.play([note(64, 0, 100)]);
  await advance(0);
  assert.deepEqual(await old, { cancelled: true });
  assert.deepEqual([...synth.voices.keys()], [64]);
  await advance(140);
  assert.deepEqual(await next, { cancelled: false });
});

test('old note-off cannot cut a retriggered MIDI after FIFO stealing', async () => {
  const { queue, log, frames, advance } = setup(1);
  const playing = queue.play([
    note(60, 0, 500), note(62, 100, 100), note(60, 100, 800),
  ]);
  await advance(500);
  assert.equal(log.filter(([type, midi]) => type === 'off' && midi === 60).length, 1);
  assert.deepEqual(frames.at(-1), [60]);
  await advance(1040);
  await playing;
  assert.deepEqual(log.filter(([type, midi]) => type === 'off' && midi === 60), [
    ['off', 60, 100], ['off', 60, 1000],
  ]);
});

test('same MIDI overlaps retrigger and ignore the old end event', async () => {
  const { queue, log, advance } = setup();
  const playing = queue.play([note(60, 0, 300), note(60, 100, 500)]);
  await advance(640);
  await playing;
  assert.deepEqual(log, [
    ['on', 60, 0], ['off', 60, 100], ['on', 60, 100], ['off', 60, 600],
  ]);
});

test('empty or zero-duration recordings finish without a stuck voice', async () => {
  const { queue, synth, advance } = setup();
  assert.deepEqual(await queue.play([]), { cancelled: false });
  const playing = queue.play([note(60, 0, 0)]);
  await advance(40);
  await playing;
  assert.equal(synth.voices.size, 0);
});

test('audio failure clears voices and allows a later attempt', async () => {
  const { queue, synth, advance } = setup();
  const original = synth.noteOn;
  synth.noteOn = () => { throw new Error('audio failure'); };
  await assert.rejects(queue.play([note(60, 0, 100)]), /audio failure/);
  assert.equal(queue.isPlaying, false);
  assert.equal(synth.voices.size, 0);
  synth.noteOn = original;
  const retry = queue.play([note(60, 0, 100)]);
  await advance(140);
  await retry;
});

test('dispose cancels playback and rejects future plays; invalid input is rejected', async () => {
  const { queue, advance } = setup();
  assert.throws(() => queue.play([note(60, -1, 1)]), TypeError);
  assert.throws(() => queue.play([], 3), RangeError);
  const playing = queue.play([note(60, 1000, 100)]);
  await advance(0);
  queue.dispose();
  assert.deepEqual(await playing, { cancelled: true });
  assert.throws(() => queue.play([]), /đóng/);
});
