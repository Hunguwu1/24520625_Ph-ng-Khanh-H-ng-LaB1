import type { TrackInfo, TrackStatus } from './audio-types';

export interface QueueActions {
  onAdd: (url: string) => void;
  onPlay: () => void | Promise<void>;
  onStop: () => void;
  onCancel: (id: string) => void;
  onClear: () => void;
}

const statusLabels: Record<TrackStatus, string> = {
  queued: 'Đang chờ',
  loading: 'Đang tải và giải mã...',
  ready: 'Sẵn sàng phát',
  playing: 'Đang phát',
  completed: 'Đã phát xong',
  cancelled: 'Đã hủy',
  error: 'Lỗi',
};

export function createQueueView(root: HTMLElement, actions: QueueActions) {
  const document = root.ownerDocument;

  root.innerHTML = `
    <main class="container">
      <h1>FIFO Audio Visualizer</h1>
      <p>Thêm bài nhạc vào hàng đợi theo thứ tự.</p>

      <form id="track-form">
        <label for="track-url">Đường dẫn bài nhạc</label>
        <div class="input-row">
          <input
            id="track-url"
            type="url"
            placeholder="${window.location.origin}/audio/test.mp3"
            required
          />
          <button type="submit">Thêm vào hàng đợi</button>
        </div>
      </form>

      <div class="input-row">
        <button id="play" type="button">Phát</button>
        <button id="stop" type="button" disabled>Dừng</button>
        <button id="clear-queue" type="button">Xóa hàng đợi</button>
      </div>

      <section class="visualizer-panel">
        <h2>Biểu đồ tần số</h2>
        <canvas
          id="visualizer"
          width="900"
          height="260"
          aria-label="Biểu đồ tần số âm thanh"
        ></canvas>
      </section>

      <section class="queue-panel">
        <h2>Hàng đợi: <span id="queue-count">0</span> bài</h2>
        <p id="empty-message">Chưa có bài nhạc nào.</p>
        <ol id="queue-list"></ol>
      </section>
    </main>
  `;

  const form = root.querySelector<HTMLFormElement>('#track-form')!;
  const input = root.querySelector<HTMLInputElement>('#track-url')!;
  const list = root.querySelector<HTMLOListElement>('#queue-list')!;
  const count = root.querySelector<HTMLSpanElement>('#queue-count')!;
  const emptyMessage = root.querySelector<HTMLParagraphElement>('#empty-message')!;
  const playButton = root.querySelector<HTMLButtonElement>('#play')!;
  const stopButton = root.querySelector<HTMLButtonElement>('#stop')!;
  const clearButton = root.querySelector<HTMLButtonElement>('#clear-queue')!;
  const canvas = root.querySelector<HTMLCanvasElement>('#visualizer')!;

  const handleSubmit = (event: SubmitEvent): void => {
    event.preventDefault();
    const url = input.value.trim();
    if (!url) return;

    actions.onAdd(url);
    input.value = '';
    input.focus();
  };

  const handlePlay = (): void => {
    void actions.onPlay();
  };
  const handleStop = (): void => actions.onStop();
  const handleClear = (): void => actions.onClear();

  form.addEventListener('submit', handleSubmit);
  playButton.addEventListener('click', handlePlay);
  stopButton.addEventListener('click', handleStop);
  clearButton.addEventListener('click', handleClear);

  const render = (tracks: readonly TrackInfo[]): void => {
    list.replaceChildren();
    count.textContent = String(tracks.length);
    emptyMessage.hidden = tracks.length > 0;

    for (const track of tracks) {
      const item = document.createElement('li');
      const url = document.createElement('span');
      url.className = 'track-url';
      url.textContent = track.url;

      const status = document.createElement('span');
      status.className = 'track-status';
      status.textContent = track.status === 'error'
        ? `Lỗi: ${track.error ?? 'Không xác định'}`
        : statusLabels[track.status];

      item.append(url, status);

      if (track.status === 'queued' || track.status === 'loading') {
        const id = track.id;
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.textContent = 'Hủy';
        // Chỉ giữ id, không giữ buffer âm thanh trong callback giao diện.
        cancelButton.addEventListener('click', () => actions.onCancel(id));
        item.append(cancelButton);
      }

      list.append(item);
    }
  };

  const setPlaybackActive = (active: boolean): void => {
    playButton.disabled = active;
    stopButton.disabled = !active;
  };

  const clearInput = (): void => {
    input.value = '';
  };

  const showMessage = (message: string): void => {
    window.alert(message);
  };

  const dispose = (): void => {
    form.removeEventListener('submit', handleSubmit);
    playButton.removeEventListener('click', handlePlay);
    stopButton.removeEventListener('click', handleStop);
    clearButton.removeEventListener('click', handleClear);
    list.replaceChildren();
  };

  return { canvas, render, setPlaybackActive, clearInput, showMessage, dispose };
}
