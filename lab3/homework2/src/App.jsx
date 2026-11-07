import { useCallback, useEffect, useRef, useState } from 'react';
import PianoKey from './components/PianoKey';
import { PolyphonicSynth } from './audio/PolyphonicSynth';
import { NoteRecorder } from './audio/NoteRecorder';
import { AudioTaskQueue } from './audio/AudioTaskQueue';
import { generatePianoKeys } from './utils/generatePianoKeys';
import './App.css';

const pianoKeys = generatePianoKeys();
const whiteCount = pianoKeys.filter((key) => !key.isBlack).length;
const blackCount = pianoKeys.length - whiteCount;
const frequencyByMidi = new Map(pianoKeys.map((key) => [key.midi, key.freqHz]));
const nameByMidi = new Map(pianoKeys.map((key) => [key.midi, key.noteName]));
let whiteIndex = 0;

const positionedKeys = pianoKeys.map((key) => ({
  ...key,
  // Phím đen nằm ở ranh giới sau phím trắng trước đó.
  position: key.isBlack ? whiteIndex : whiteIndex++,
}));

export default function App() {
  const synthRef = useRef(null);
  const recorderRef = useRef(null);
  const playbackRef = useRef(null);
  const playbackVersion = useRef(0);
  const [pressedKeys, setPressedKeys] = useState(() => new Set());
  const [audioError, setAudioError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const invalidatePlayback = useCallback(() => {
    playbackVersion.current++;
  }, []);

  const updateRecording = useCallback(() => {
    if (recorderRef.current?.isRecording) {
      setRecordedNotes(recorderRef.current.snapshot());
    }
  }, []);

  const stopAll = useCallback(() => {
    invalidatePlayback();
    playbackRef.current?.stop();
    setIsPlaying(false);
    synthRef.current?.stopAll();
    recorderRef.current?.releaseAll();
    updateRecording();
    setPressedKeys((previous) => previous.size ? new Set() : previous);
  }, [updateRecording, invalidatePlayback]);

  const startRecording = () => {
    if (playbackRef.current?.isPlaying) return;
    stopAll();
    recorderRef.current ??= new NoteRecorder();
    recorderRef.current.start();
    setRecordedNotes([]);
    setIsRecording(true);
  };

  const stopRecording = () => {
    setRecordedNotes(recorderRef.current?.stop() ?? []);
    setIsRecording(false);
    stopAll();
  };

  const clearRecording = () => {
    if (playbackRef.current?.isPlaying) return;
    if (recorderRef.current?.clear()) setRecordedNotes([]);
  };

  const playRecording = async () => {
    if (recorderRef.current?.isRecording || recordedNotes.length === 0) return;
    stopAll();
    synthRef.current ??= new PolyphonicSynth();
    playbackRef.current ??= new AudioTaskQueue(synthRef.current, setPressedKeys);
    const version = ++playbackVersion.current;
    setIsPlaying(true);
    setAudioError('');
    try {
      await playbackRef.current.play(recordedNotes, speed);
    } catch (error) {
      if (version === playbackVersion.current) {
        setAudioError(`Không phát lại được bản ghi: ${error.message}`);
      }
    } finally {
      if (version === playbackVersion.current) setIsPlaying(false);
    }
  };

  const onNoteOn = useCallback((midi) => {
    if (playbackRef.current?.isPlaying) return;
    synthRef.current ??= new PolyphonicSynth();
    const reportError = (error) => {
      stopAll();
      setAudioError(`Không phát được âm thanh: ${error.message}`);
    };
    try {
      const { stolenMidi, resumed } = synthRef.current.noteOn(midi, frequencyByMidi.get(midi));
      if (stolenMidi !== null) recorderRef.current?.noteOff(stolenMidi);
      recorderRef.current?.noteOn(midi, frequencyByMidi.get(midi));
      updateRecording();
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
  }, [stopAll, updateRecording]);

  const onNoteOff = useCallback((midi) => {
    if (playbackRef.current?.isPlaying) return;
    synthRef.current?.noteOff(midi);
    recorderRef.current?.noteOff(midi);
    updateRecording();
    setPressedKeys((previous) => {
      if (!previous.has(midi)) return previous;
      const next = new Set(previous);
      next.delete(midi);
      return next;
    });
  }, [updateRecording]);

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
      invalidatePlayback();
      playbackRef.current?.dispose();
      playbackRef.current = null;
      synthRef.current?.dispose();
      recorderRef.current?.stop();
      synthRef.current = null;
    };
  }, [stopAll, invalidatePlayback]);

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

      <section className="recorder" aria-label="Ghi thao tác chơi đàn">
        <h2>Ghi thao tác chơi đàn</h2>
        <div className="recorder-controls">
          <button type="button" onClick={startRecording} disabled={isRecording || isPlaying}>
            Bắt đầu ghi
          </button>
          <button type="button" onClick={stopRecording} disabled={!isRecording}>
            Kết thúc ghi
          </button>
          <button type="button" onClick={clearRecording} disabled={isRecording || isPlaying || recordedNotes.length === 0}>
            Xóa bản ghi
          </button>
        </div>
        <p role="status">
          {isRecording ? 'Đang ghi' : 'Chưa ghi / đã kết thúc'} · Số nốt đã ghi: {recordedNotes.length}
        </p>
        <p>Bắt đầu ghi sẽ thay bản ghi cũ. Bản ghi được giữ trong phiên hiện tại, tải lại trang sẽ xóa.</p>
        <div className="recorder-controls">
          <label>
            Tốc độ phát{' '}
            <select value={speed} disabled={isPlaying} onChange={(event) => setSpeed(Number(event.target.value))}>
              <option value={0.5}>0.5×</option>
              <option value={1}>1×</option>
              <option value={2}>2×</option>
            </select>
          </label>
          <button type="button" onClick={playRecording} disabled={isRecording || isPlaying || recordedNotes.length === 0}>
            Phát bản ghi
          </button>
          <button type="button" onClick={stopAll} disabled={!isPlaying}>Dừng phát</button>
        </div>
        <p role="status">{isPlaying ? 'Đang phát — bàn phím tạm khóa' : 'Không phát bản ghi'}</p>
        {isRecording && <p>Thời lượng từng nốt được chốt khi thả phím hoặc dừng âm.</p>}
        {recordedNotes.length > 0 && (
          <details>
            <summary>Xem dữ liệu bản ghi</summary>
            <div className="recording-table-wrapper">
              <table className="recording-table">
                <caption>Các nốt theo thứ tự nhấn</caption>
                <thead>
                  <tr>
                    <th scope="col">STT</th>
                    <th scope="col">Nốt</th>
                    <th scope="col">MIDI</th>
                    <th scope="col">Tần số (Hz)</th>
                    <th scope="col">Thời lượng (ms)</th>
                    <th scope="col">Cách nốt trước (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  {recordedNotes.map((note, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{nameByMidi.get(note.midi)}</td>
                      <td>{note.midi}</td>
                      <td>{note.freqHz.toFixed(2)}</td>
                      <td>{note.durationMs.toFixed(1)}</td>
                      <td>{note.deltaMs.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}
      </section>

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
              disabled={isPlaying}
              onNoteOn={onNoteOn}
              onNoteOff={onNoteOff}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
