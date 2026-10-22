import './style.css';
import { AudioEngine } from './audio-engine';
import { createQueueView } from './queue-view';

const view = createQueueView(document.querySelector<HTMLDivElement>('#app')!, {
  onAdd: (url) => engine.add(url),
  onPlay: () => engine.play(),
  onStop: () => engine.stop(),
  onCancel: (id) => engine.cancel(id),
  onClear: () => {
    engine.clear();
    view.clearInput();
  },
});

const engine = new AudioEngine(view.canvas, {
  onChange: (state) => {
    view.render(state.tracks);
    view.setPlaybackActive(state.playbackActive);
  },
  onMessage: (message) => view.showMessage(message),
});

const handlePageHide = (): void => {
  engine.dispose();
  view.clearInput();
};

window.addEventListener('pagehide', handlePageHide);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.removeEventListener('pagehide', handlePageHide);
    engine.dispose();
    view.dispose();
  });
}
