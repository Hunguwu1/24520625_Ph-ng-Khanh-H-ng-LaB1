export class NoteRecorder {
  constructor(now = () => performance.now()) {
    this.now = now;
    this.isRecording = false;
    this.notes = [];
    this.activeNotes = new Map();
    this.lastStart = 0;
  }

  start() {
    this.notes = [];
    this.activeNotes.clear();
    this.lastStart = this.now();
    this.isRecording = true;
  }

  noteOn(midi, freqHz) {
    if (!this.isRecording || this.activeNotes.has(midi)) return;
    const startedAt = this.now();
    const note = {
      midi,
      freqHz,
      durationMs: 0,
      deltaMs: startedAt - this.lastStart,
    };
    // Thêm ngay khi nhấn để thứ tự không phụ thuộc thứ tự thả phím.
    this.notes.push(note);
    this.activeNotes.set(midi, { note, startedAt });
    this.lastStart = startedAt;
  }

  noteOff(midi) {
    const active = this.activeNotes.get(midi);
    if (!active) return;
    active.note.durationMs = this.now() - active.startedAt;
    this.activeNotes.delete(midi);
  }

  releaseAll() {
    if (this.activeNotes.size === 0) return;
    const endedAt = this.now();
    for (const { note, startedAt } of this.activeNotes.values()) {
      note.durationMs = endedAt - startedAt;
    }
    this.activeNotes.clear();
  }

  stop() {
    this.releaseAll();
    this.isRecording = false;
    return this.snapshot();
  }

  clear() {
    if (this.isRecording) return false;
    this.notes = [];
    this.activeNotes.clear();
    return true;
  }

  snapshot() {
    // Không để giao diện hoặc bộ phát lại sửa dữ liệu đang ghi.
    return this.notes.map((note) => ({ ...note }));
  }
}
