import { useCallback, useEffect, useRef, useState } from "react";
import { useDrumKeyboard } from "./useDrumKeyboard";
import { useDrumAudio } from "./useDrumAudio";
import type { DrumPad } from "./useDrumKeyboard";
import "./App.css";

const pads: DrumPad[] = [
  {
    id: "tom1",
    name: "Tom 1",
    key: "W",
    code: "KeyW",
    src: "/sounds/tom1.mp3",
  },
  {
    id: "kick",
    name: "Kick",
    key: "A",
    code: "KeyA",
    src: "/sounds/kick.wav",
  },
  {
    id: "snare",
    name: "Snare",
    key: "S",
    code: "KeyS",
    src: "/sounds/snare.wav",
  },
  {
    id: "hihat",
    name: "Hi-hat",
    key: "D",
    code: "KeyD",
    src: "/sounds/hihat.wav",
  },
  {
    id: "tom2",
    name: "Tom 2",
    key: "J",
    code: "KeyJ",
    src: "/sounds/tom2.mp3",
  },
  {
    id: "crash",
    name: "Crash",
    key: "K",
    code: "KeyK",
    src: "/sounds/crash.mp3",
  },
  {
    id: "ride",
    name: "Ride",
    key: "L",
    code: "KeyL",
    src: "/sounds/ride.mp3",
  },
];

// Đặt ngoài component để không tạo lại mỗi lần render.
const padMap = new Map(pads.map((pad) => [pad.code, pad]));

export default function App() {
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true);
  const [note, setNote] = useState("");
  const { playSound, levelDb, audioError } = useDrumAudio();
  const [activePads, setActivePads] = useState<string[]>([]);
  const [hitHistory, setHitHistory] = useState<
    { id: number; name: string }[]
  >([]);
  const hitCounter = useRef(0);
  const timers = useRef(
    new Map<string, ReturnType<typeof setTimeout>>()
  );

  useEffect(() => {
    const pendingTimers = timers.current;

    return () => {
      pendingTimers.forEach((timer) => clearTimeout(timer));
      pendingTimers.clear();
    };
  }, []);

  const triggerPad = useCallback((pad: DrumPad) => {
    setActivePads((current) =>
      current.includes(pad.id) ? current : [...current, pad.id]
    );

    // Mỗi pad có bộ hẹn giờ riêng để hỗ trợ đánh nhiều pad cùng lúc.
    const previousTimer = timers.current.get(pad.id);
    if (previousTimer !== undefined) clearTimeout(previousTimer);

    const timer = setTimeout(() => {
      setActivePads((current) => current.filter((id) => id !== pad.id));
      timers.current.delete(pad.id);
    }, 150);
    timers.current.set(pad.id, timer);

    hitCounter.current += 1;
    const hit = { id: hitCounter.current, name: pad.name };
    setHitHistory((current) => [hit, ...current].slice(0, 10));

    void playSound(pad.src);
  }, [playSound]);

  useDrumKeyboard(padMap, triggerPad, shortcutsEnabled);

  return (
    <main>
      <h1>Production Studio Drum Kit</h1>
      <p>Nhấn W, A, S, D, J, K, L hoặc chọn một nút để đánh trống.</p>

      <label>
        <input
          type="checkbox"
          checked={shortcutsEnabled}
          onChange={(event) =>
            setShortcutsEnabled(event.target.checked)
          }
        />
        Bật phím tắt
      </label>

      <section aria-labelledby="pads-heading">
        <h2 id="pads-heading">Bộ trống</h2>

        <div className="drum-pads">
          {pads.map((pad) => (
            <button
              key={pad.id}
              type="button"
              className="drum-pad"
              onClick={() => triggerPad(pad)}
              data-pad-id={pad.id}
              aria-keyshortcuts={shortcutsEnabled ? pad.key : undefined}
              aria-pressed={activePads.includes(pad.id)}
            >
              <span>{pad.name}</span>
              <kbd>{pad.key}</kbd>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="level-heading">
        <h2 id="level-heading">Mức âm thanh</h2>
        <label htmlFor="audio-level">Mức tín hiệu âm thanh (dBFS)</label>
        <meter
          id="audio-level"
          min={-60}
          max={0}
          value={levelDb}
          aria-describedby="level-description"
        />
        <p className="audio-level-value">
          {levelDb <= -60
            ? "Không có tín hiệu đáng kể"
            : `${levelDb.toFixed(1)} dBFS`}
        </p>
        <p id="level-description">
          Đo tín hiệu âm thanh trong ứng dụng, từ -60 đến 0 dBFS.
          Đây không phải mức độ ồn ngoài môi trường.
        </p>
        <p role="status">{audioError}</p>
      </section>

      <section aria-labelledby="history-heading">
        <h2 id="history-heading">Lịch sử đánh trống</h2>
        <output aria-live="polite" aria-atomic="true">
          {hitHistory.length > 0
            ? `Lần ${hitHistory[0].id}: ${hitHistory[0].name}`
            : "Chưa có lần đánh nào."}
        </output>
        <p>Hiển thị tối đa 10 lần đánh, mới nhất ở trên.</p>
        <ul>
          {hitHistory.map((hit) => (
            <li key={hit.id}>
              Lần {hit.id}: {hit.name}
            </li>
          ))}
        </ul>
      </section>

      <p>
        <label htmlFor="beat-note">Ghi chú nhịp trống: </label>
        <input
          id="beat-note"
          type="text"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </p>
      <footer>
        <p>
          Âm thanh bổ sung từ{" "}
          <a href="https://github.com/teropa/drumkit">teropa/drumkit</a>.
          {" "}<a href="/sounds/CREDITS.md">Nguồn và giấy phép âm thanh</a>.
        </p>
      </footer>
    </main>
  );
}
