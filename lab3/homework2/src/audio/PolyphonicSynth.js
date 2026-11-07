// Map giữ thứ tự bật nốt để thay voice cũ nhất theo FIFO.
export class PolyphonicSynth {
  constructor(maxVoices = 8) {
    if (!Number.isInteger(maxVoices) || maxVoices < 1) {
      throw new RangeError('Số voice tối đa phải là số nguyên dương.');
    }
    this.maxVoices = maxVoices;
    this.ctx = null;
    this.voices = new Map();
    this.allVoices = new Set();
    this.disposed = false;
  }

  prepare() {
    if (this.disposed) throw new Error('Bộ phát đã được đóng.');
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) throw new Error('Trình duyệt chưa hỗ trợ Web Audio API.');
    this.ctx ??= new AudioContextClass();
    return this.ctx.state === 'suspended' ? this.ctx.resume() : Promise.resolve();
  }

  noteOn(midi, freqHz) {
    if (this.disposed) throw new Error('Bộ phát đã được đóng.');
    if (this.voices.has(midi)) {
      return { stolenMidi: null, resumed: Promise.resolve() };
    }

    const resumed = this.prepare();
    const ctx = this.ctx;
    let stolenMidi = null;
    if (this.voices.size >= this.maxVoices) {
      stolenMidi = this.voices.keys().next().value;
      // Giữ phần giảm âm 40 ms để tránh tiếng tạch khi thay voice.
      this.noteOff(stolenMidi);
    }
    // Resume trong thao tác người dùng, không chờ trước khi đăng ký voice.
    // Vì vậy thao tác thả phím vẫn hủy được nốt nếu resume chưa hoàn tất.
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const voice = { osc, gain };

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freqHz, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
      this.allVoices.delete(voice);
      if (this.voices.get(midi) === voice) this.voices.delete(midi);
    };
    this.voices.set(midi, voice);
    this.allVoices.add(voice);
    osc.start();
    return { stolenMidi, resumed };
  }

  noteOff(midi) {
    const voice = this.voices.get(midi);
    if (!voice) return;
    this.voices.delete(midi);
    const now = this.ctx.currentTime;
    const param = voice.gain.gain;
    if (typeof param.cancelAndHoldAtTime === 'function') {
      param.cancelAndHoldAtTime(now);
    } else {
      const value = Math.max(param.value, 0.0001);
      param.cancelScheduledValues(now);
      param.setValueAtTime(value, now);
    }
    param.exponentialRampToValueAtTime(0.0001, now + 0.04);
    voice.osc.stop(now + 0.04);
  }

  stopAll() {
    this.voices.clear();
    // Bao gồm các voice đã thả nhưng còn trong giai đoạn giảm âm.
    for (const voice of this.allVoices) {
      voice.osc.onended = null;
      voice.osc.stop();
      voice.osc.disconnect();
      voice.gain.disconnect();
    }
    this.allVoices.clear();
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stopAll();
    if (this.ctx && this.ctx.state !== 'closed') {
      void this.ctx.close().catch(() => {});
    }
  }
}
