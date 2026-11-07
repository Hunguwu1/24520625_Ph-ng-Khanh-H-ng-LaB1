import { useCallback, useEffect, useRef, useState } from 'react';
import PianoKey from './components/PianoKey';
import { PolyphonicSynth } from './audio/PolyphonicSynth';
import { generatePianoKeys } from './utils/generatePianoKeys';
import './App.css';

const pianoKeys = generatePianoKeys();
const whiteCount = pianoKeys.filter((key) => !key.isBlack).length;
const blackCount = pianoKeys.length - whiteCount;
const frequencyByMidi = new Map(pianoKeys.map((key) => [key.midi, key.freqHz]));
let whiteIndex = 0;

const positionedKeys = pianoKeys.map((key) => ({
  ...key,
  // Phím đen nằm ở ranh giới sau phím trắng trước đó.
  position: key.isBlack ? whiteIndex : whiteIndex++,
}));

export default function App() {
  const synthRef = useRef(null);
  const [pressedKeys, setPressedKeys] = useState(() => new Set());
  const [audioError, setAudioError] = useState('');

  const stopAll = useCallback(() => {
    synthRef.current?.stopAll();
    setPressedKeys((previous) => previous.size ? new Set() : previous);
  }, []);

  const onNoteOn = useCallback((midi) => {
    synthRef.current ??= new PolyphonicSynth();
    const reportError = (error) => {
      stopAll();
      setAudioError(`Không phát được âm thanh: ${error.message}`);
    };
    try {
      const { stolenMidi, resumed } = synthRef.current.noteOn(midi, frequencyByMidi.get(midi));
      setAudioError('');
      setPressedKeys((previous) => {
        if (stolenMidi === null && previous.has(midi)) return previous;
        const next = new Set(previous);
        if (stolenMidi !== null) next.delete(stolenMidi);
        next.add(midi);
        return next;
      });
      void resumed.catch(reportError);
    } catch (error) {
      reportError(error);
    }
  }, [stopAll]);

  const onNoteOff = useCallback((midi) => {
    synthRef.current?.noteOff(midi);
    setPressedKeys((previous) => {
      if (!previous.has(midi)) return previous;
      const next = new Set(previous);
      next.delete(midi);
      return next;
    });
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) stopAll();
    };
    window.addEventListener('blur', stopAll);
    window.addEventListener('pagehide', stopAll);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('blur', stopAll);
      window.removeEventListener('pagehide', stopAll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      synthRef.current?.dispose();
      synthRef.current = null;
    };
  }, [stopAll]);

  return (
    <main className="piano-app">
      <h1>Piano 88 phím</h1>
      <p>
        {pianoKeys.length} phím từ A0 đến C8 · {whiteCount} phím trắng · {blackCount} phím đen
      </p>
      <p>Cuộn ngang để xem toàn bộ bàn phím.</p>
      <p>Nhấn giữ phím để phát âm, thả để dừng. Có thể dùng nhiều ngón tay trên màn hình cảm ứng.</p>
      <p>Dùng Tab để chọn phím, rồi giữ Space hoặc Enter để chơi.</p>
      <p>Tối đa 8 nốt cùng lúc. Nốt thứ 9 thay thế nốt đang giữ lâu nhất.</p>
      <button type="button" className="stop-audio" onClick={stopAll}>Dừng tất cả âm</button>
      {audioError && <p role="alert">{audioError}</p>}

      <div
        className="piano-scroll"
        role="region"
        aria-label="Bàn phím piano"
        tabIndex={0}
      >
        <div className="piano-keyboard">
          {positionedKeys.map((key) => (
            <PianoKey
              key={key.midi}
              midi={key.midi}
              noteName={key.noteName}
              isBlack={key.isBlack}
              position={key.position}
              isPressed={pressedKeys.has(key.midi)}
              onNoteOn={onNoteOn}
              onNoteOff={onNoteOff}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
