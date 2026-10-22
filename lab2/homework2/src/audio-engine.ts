import { AudioPlayer } from './audio-player';
import { AudioTaskQueue } from './audio-queue-controller';
import type { AudioEngineState, AudioTrack } from './audio-types';

export interface AudioEngineCallbacks {
  onChange: (state: AudioEngineState) => void;
  onMessage: (message: string) => void;
}

export class AudioEngine {
  private tracks: AudioTrack[] = [];
  private audioContext: AudioContext | null = null;
  private taskQueue: AudioTaskQueue | null = null;
  private player: AudioPlayer | null = null;
  private currentTrack: AudioTrack | null = null;
  private autoPlayEnabled = false;
  private playbackActive = false;
  private playbackRequest = 0;
  private generation = 0;
  private canvas: HTMLCanvasElement;
  private callbacks: AudioEngineCallbacks;

  constructor(canvas: HTMLCanvasElement, callbacks: AudioEngineCallbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.notify();
  }

  add(url: string): void {
    const track: AudioTrack = {
      id: crypto.randomUUID(),
      url,
      status: 'queued',
      controller: new AbortController(),
    };

    this.tracks.push(track);
    this.notify();
    void this.prepareTrack(track);
  }

  async play(): Promise<void> {
    if (this.playbackActive) return;

    if (!this.findNextTrack()) {
      this.callbacks.onMessage('Hãy thêm một bài nhạc trước.');
      return;
    }

    const request = ++this.playbackRequest;
    this.playbackActive = true;
    this.notify();

    try {
      this.audioContext ??= new AudioContext();
      await this.audioContext.resume();

      // Dừng hoặc xóa trong lúc resume đang chờ vô hiệu hóa lần phát cũ.
      if (request !== this.playbackRequest) return;

      this.autoPlayEnabled = true;
      this.playNextTrack();
    } catch (error) {
      if (request !== this.playbackRequest) return;

      this.autoPlayEnabled = false;
      this.playbackActive = false;
      this.notify();
      this.callbacks.onMessage(
        error instanceof Error ? error.message : 'Không khởi động được âm thanh.',
      );
    }
  }

  stop(): void {
    this.autoPlayEnabled = false;
    this.playbackActive = false;
    this.playbackRequest++;
    this.player?.stop();

    if (this.currentTrack) {
      this.currentTrack.status = 'ready';
    }

    this.currentTrack = null;
    this.notify();
  }

  cancel(id: string): void {
    const track = this.tracks.find((item) => item.id === id);
    if (!track || (track.status !== 'queued' && track.status !== 'loading')) return;

    track.controller.abort();
    track.status = 'cancelled';
    track.buffer = undefined;
    this.notify();
    this.playNextTrack();
  }

  clear(): void {
    // Kết quả bất đồng bộ thuộc danh sách cũ không được cập nhật giao diện mới.
    this.generation++;
    this.autoPlayEnabled = false;
    this.playbackActive = false;
    this.playbackRequest++;
    this.player?.dispose();
    this.player = null;
    this.currentTrack = null;

    for (const track of this.tracks) {
      track.controller.abort();
      track.status = 'cancelled';
      track.buffer = undefined;
    }

    this.tracks.length = 0;
    this.notify();
  }

  dispose(): void {
    this.clear();

    const context = this.audioContext;
    this.audioContext = null;
    this.taskQueue = null;

    if (context && context.state !== 'closed') {
      void context.close().catch((error) => {
        console.error('Không đóng được AudioContext:', error);
      });
    }
  }

  private async prepareTrack(track: AudioTrack): Promise<void> {
    const generation = this.generation;

    try {
      this.audioContext ??= new AudioContext();
      this.taskQueue ??= new AudioTaskQueue(this.audioContext, 2);

      const buffer = await this.taskQueue.enqueue(
        track.url,
        () => {
          track.status = 'loading';
          this.notify();
        },
        track.controller.signal,
      );

      track.controller.signal.throwIfAborted();
      track.buffer = buffer;
      track.status = 'ready';
    } catch (error) {
      if (track.controller.signal.aborted) {
        track.status = 'cancelled';
        track.buffer = undefined;
      } else {
        track.status = 'error';
        track.error = error instanceof Error ? error.message : 'Không tải được bài nhạc';
      }
    } finally {
      if (generation === this.generation) {
        this.notify();
        this.playNextTrack();
      }
    }
  }

  private findNextTrack(): AudioTrack | undefined {
    return this.tracks.find(
      (track) =>
        track.status !== 'completed' &&
        track.status !== 'error' &&
        track.status !== 'cancelled',
    );
  }

  private playNextTrack(): void {
    if (!this.autoPlayEnabled || this.player?.isPlaying || !this.audioContext) return;

    const track = this.findNextTrack();

    if (!track) {
      this.autoPlayEnabled = false;
      this.playbackActive = false;
      this.notify();
      return;
    }

    // Giữ đúng FIFO khi bài phía sau tải xong trước bài đầu tiên.
    if (track.status !== 'ready' || !track.buffer) return;

    try {
      this.player ??= new AudioPlayer(this.audioContext, this.canvas);
      this.currentTrack = track;
      this.player.play(track.buffer, () => {
        track.status = 'completed';
        track.buffer = undefined;
        this.currentTrack = null;
        this.notify();
        this.playNextTrack();
      });

      track.status = 'playing';
      this.notify();
    } catch (error) {
      this.autoPlayEnabled = false;
      this.playbackActive = false;
      this.player?.stop();
      this.currentTrack = null;
      track.status = 'ready';
      this.notify();
      this.callbacks.onMessage(
        error instanceof Error ? error.message : 'Không phát được bài nhạc.',
      );
    }
  }

  private notify(): void {
    this.callbacks.onChange({
      tracks: this.tracks.map(({ id, url, status, error }) => ({ id, url, status, error })),
      playbackActive: this.playbackActive,
    });
  }
}
