import { createVisualizer } from './visualizer';

export class AudioPlayer {
  private audioContext: AudioContext;
  private canvas: HTMLCanvasElement;
  private currentSource: AudioBufferSourceNode | null = null;
  private visualizer: ReturnType<typeof createVisualizer> | null = null;
  private disposed = false;

  constructor(audioContext: AudioContext, canvas: HTMLCanvasElement) {
    this.audioContext = audioContext;
    this.canvas = canvas;
  }

  get isPlaying(): boolean {
    return this.currentSource !== null;
  }

  play(buffer: AudioBuffer, onEnded: () => void): void {
    if (this.disposed) {
      throw new Error('Bộ phát đã được giải phóng.');
    }

    this.stop();
    this.visualizer ??= createVisualizer(this.audioContext, this.canvas);

    // Mỗi lần phát dùng một source mới, kể cả khi phát lại cùng buffer.
    const source = this.audioContext.createBufferSource();
    let started = false;

    try {
      source.buffer = buffer;
      source.connect(this.visualizer.analyser);
      this.currentSource = source;

      source.onended = () => {
        if (this.currentSource !== source) return;

        this.currentSource = null;
        this.releaseSource(source, false);
        this.visualizer?.stop();
        onEnded();
      };

      source.start();
      started = true;
      this.visualizer.start();
    } catch (error) {
      this.currentSource = null;
      this.releaseSource(source, started);
      this.visualizer.stop();
      throw error;
    }
  }

  stop(): void {
    const source = this.currentSource;
    this.currentSource = null;

    if (source) {
      this.releaseSource(source, true);
    }

    this.visualizer?.stop();
  }

  dispose(): void {
    if (this.disposed) return;

    this.stop();
    this.visualizer?.dispose();
    this.visualizer = null;
    this.disposed = true;
  }

  private releaseSource(source: AudioBufferSourceNode, stop: boolean): void {
    // Bỏ callback trước khi stop để không báo bài đã phát xong.
    source.onended = null;
    if (stop) source.stop();
    source.disconnect();
    source.buffer = null;
  }
}
