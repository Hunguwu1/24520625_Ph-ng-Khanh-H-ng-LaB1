// Phát các mốc bật/tắt theo một đồng hồ chung, không chờ hết nốt mới bật nốt sau.
export class AudioTaskQueue {
  constructor(synth, onVoices = () => {}, timing = {}) {
    this.synth = synth;
    this.onVoices = onVoices;
    this.now = timing.now ?? (() => performance.now());
    this.setTimer = timing.setTimeout ?? ((fn, delay) => globalThis.setTimeout(fn, delay));
    this.clearTimer = timing.clearTimeout ?? ((id) => globalThis.clearTimeout(id));
    this.current = null;
    this.disposed = false;
  }

  get isPlaying() {
    return this.current !== null;
  }

  waitFor(promise, signal) {
    return new Promise((resolve, reject) => {
      const abort = () => {
        signal.removeEventListener('abort', abort);
        reject(signal.reason);
      };
      if (signal.aborted) {
        reject(signal.reason);
        return;
      }
      signal.addEventListener('abort', abort, { once: true });
      Promise.resolve(promise).then(resolve, reject).finally(() => {
        signal.removeEventListener('abort', abort);
      });
    });
  }

  waitUntil(deadline, signal) {
    return new Promise((resolve, reject) => {
      signal.throwIfAborted();
      const abort = () => {
        this.clearTimer(timer);
        reject(signal.reason);
      };
      const timer = this.setTimer(() => {
        signal.removeEventListener('abort', abort);
        resolve();
      }, Math.max(0, deadline - this.now()));
      signal.addEventListener('abort', abort, { once: true });
    });
  }

  play(notes, speed = 1) {
    if (this.disposed) throw new Error('Bộ phát lại đã được đóng.');
    if (![0.5, 1, 2].includes(speed)) throw new RangeError('Tốc độ phát không hợp lệ.');
    let onset = 0;
    const events = [];
    notes.forEach((note, id) => {
      if (!Number.isInteger(note.midi) || note.midi < 21 || note.midi > 108 ||
          !Number.isFinite(note.freqHz) || note.freqHz <= 0 ||
          !Number.isFinite(note.deltaMs) || note.deltaMs < 0 ||
          !Number.isFinite(note.durationMs) || note.durationMs < 0) {
        throw new TypeError('Dữ liệu nốt không hợp lệ.');
      }
      onset += note.deltaMs / speed;
      events.push({ time: onset, order: 1, type: 'on', id, midi: note.midi, freqHz: note.freqHz });
      events.push({ time: onset + note.durationMs / speed,
        order: note.durationMs === 0 ? 2 : 0, type: 'off', id, midi: note.midi });
    });
    events.sort((a, b) => a.time - b.time || a.order - b.order || a.id - b.id);
    this.stop();
    const run = { controller: new AbortController(), active: new Map() };
    this.current = run;
    return this.run(events, run);
  }

  async run(events, run) {
    const { signal } = run.controller;
    try {
      // prepare() gọi trong thao tác Phát; bắt đầu đồng hồ sau khi audio sẵn sàng.
      await this.waitFor(this.synth.prepare(), signal);
      signal.throwIfAborted();
      const startedAt = this.now();
      for (const event of events) {
        if (this.now() < startedAt + event.time) {
          await this.waitUntil(startedAt + event.time, signal);
        }
        signal.throwIfAborted();
        if (event.type === 'on') {
          // Retrigger cùng MIDI; token id ngăn lịch tắt cũ tắt nhầm voice mới.
          if (run.active.has(event.midi)) this.synth.noteOff(event.midi);
          const { stolenMidi, resumed } = this.synth.noteOn(event.midi, event.freqHz);
          if (stolenMidi !== null) run.active.delete(stolenMidi);
          run.active.set(event.midi, event.id);
          this.onVoices(new Set(run.active.keys()));
          await this.waitFor(resumed, signal);
        } else if (run.active.get(event.midi) === event.id) {
          this.synth.noteOff(event.midi);
          run.active.delete(event.midi);
          this.onVoices(new Set(run.active.keys()));
        }
      }
      if (events.length) {
        await this.waitUntil(startedAt + events.at(-1).time + 40, signal);
      }
      return { cancelled: false };
    } catch (error) {
      if (signal.aborted) return { cancelled: true };
      throw error;
    } finally {
      if (this.current === run) {
        this.current = null;
        this.synth.stopAll();
        this.onVoices(new Set());
      }
    }
  }

  stop() {
    const run = this.current;
    this.current = null;
    if (!run) return;
    run.controller.abort();
    this.synth.stopAll();
    this.onVoices(new Set());
  }

  dispose() {
    this.onVoices = () => {};
    this.stop();
    this.disposed = true;
  }
}
