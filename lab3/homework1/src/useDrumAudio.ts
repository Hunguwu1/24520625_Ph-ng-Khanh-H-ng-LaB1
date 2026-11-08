import { useCallback, useEffect, useRef, useState } from "react";

type AudioEngine = {
  context: AudioContext;
  analyser: AnalyserNode;
  samples: Float32Array<ArrayBuffer>;
  buffers: Map<string, Promise<AudioBuffer>>;
};

const MIN_DB = -60;

export function useDrumAudio() {
  const engine = useRef<AudioEngine | null>(null);
  const [levelDb, setLevelDb] = useState(MIN_DB);
  const [audioError, setAudioError] = useState("");

  const playSound = useCallback(async (src: string) => {
    let audio: AudioEngine | null = null;

    try {
      // Chỉ tạo AudioContext từ thao tác nhấn phím hoặc nhấp nút.
      if (!engine.current) {
        const context = new AudioContext();
        const analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        analyser.connect(context.destination);

        engine.current = {
          context,
          analyser,
          samples: new Float32Array(analyser.fftSize),
          buffers: new Map(),
        };
      }

      audio = engine.current;
      await audio.context.resume();
      if (engine.current !== audio) return;

      let bufferPromise = audio.buffers.get(src);
      if (!bufferPromise) {
        const currentAudio = audio;
        bufferPromise = fetch(src)
          .then((response) => {
            if (!response.ok) throw new Error(`Không tải được ${src}`);
            return response.arrayBuffer();
          })
          .then((data) => currentAudio.context.decodeAudioData(data));

        audio.buffers.set(src, bufferPromise);
        void bufferPromise.catch(() => currentAudio.buffers.delete(src));
      }

      const buffer = await bufferPromise;
      if (engine.current !== audio) return;

      // Mỗi lần đánh dùng một source riêng để âm thanh có thể chồng nhau.
      const source = audio.context.createBufferSource();
      source.buffer = buffer;
      source.connect(audio.analyser);
      source.onended = () => source.disconnect();
      source.start();
      setAudioError("");
    } catch (error) {
      if (engine.current !== audio) return;
      console.error("Không phát được âm thanh:", error);
      setAudioError("Không phát được âm thanh. Hãy thử lại.");
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const audio = engine.current;
      if (!audio) return;

      if (audio.context.state !== "running") {
        setLevelDb(MIN_DB);
        return;
      }

      audio.analyser.getFloatTimeDomainData(audio.samples);
      let sum = 0;
      for (const sample of audio.samples) sum += sample * sample;

      const rms = Math.sqrt(sum / audio.samples.length);
      const db = rms > 0 ? 20 * Math.log10(rms) : MIN_DB;
      setLevelDb(Math.max(MIN_DB, Math.min(0, db)));
    }, 50);

    return () => {
      clearInterval(interval);
      const audio = engine.current;
      engine.current = null;
      if (audio) {
        audio.analyser.disconnect();
        void audio.context.close().catch(console.error);
      }
    };
  }, []);

  return { playSound, levelDb, audioError };
}
