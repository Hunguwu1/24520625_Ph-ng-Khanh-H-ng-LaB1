import { playSound } from "./audio-engine.js";

import {
    startRecording,
    stopRecording,
    isRecording,
    recordBeat,
    getBeats,
} from "./recorder.js";

const pads = [...document.querySelectorAll(".drum-pad")];

const recordButton = document.querySelector("#record-btn");
const stopButton = document.querySelector("#stop-btn");
const replayButton = document.querySelector("#replay-btn");
const status = document.querySelector("#recorder-status");

let replaying = false;

function updateRecorderUI() {
    const count = getBeats().length;

    recordButton.disabled = isRecording() || replaying;
    stopButton.disabled = !isRecording();
    replayButton.disabled = isRecording() || replaying || count === 0;

    if (isRecording()) {
        status.textContent = `Recording: ${count} hits.`;
    } else if (replaying) {
        status.textContent = "Replaying recorded hits...";
    } else {
        status.textContent = `Saved: ${count} hits.`;
    }
}

// Ghi sự kiện ngay khi người dùng đánh, trước khi chờ âm thanh tải.
function triggerPad(pad) {
    recordBeat(pad.dataset.key, pad.dataset.sound);
    playSound(pad.dataset.sound);

    if (isRecording()) {
        updateRecorderUI();
    }
}

// Chuột và cảm ứng.
pads.forEach((pad) => {
    pad.addEventListener("click", () => {
        triggerPad(pad);
    });
});

// Bàn phím: giữ nguyên quy tắc của Step 3.
window.addEventListener("keydown", (event) => {
    if (event.repeat) return;
    if (event.ctrlKey || event.altKey || event.metaKey) return;

    const target = event.target;

    if (
        target instanceof HTMLElement &&
        (target.matches("input, textarea, select") ||
            target.isContentEditable)
    ) {
        return;
    }

    const key = event.key.toLowerCase();
    const pad = pads.find((item) => item.dataset.key === key);

    if (!pad) return;

    event.preventDefault();
    triggerPad(pad);
});

// Bắt đầu một bản ghi mới.
recordButton.addEventListener("click", () => {
    if (replaying) return;

    startRecording();
    updateRecorderUI();
});

// Dừng ghi và hiển thị dữ liệu để kiểm tra.
stopButton.addEventListener("click", () => {
    stopRecording();
    updateRecorderUI();

    console.table(getBeats());
});

// Phát lại bản sao của hàng đợi theo thứ tự FIFO.
replayButton.addEventListener("click", async () => {
    if (isRecording() || replaying) return;

    const queue = getBeats();

    if (queue.length === 0) return;

    replaying = true;
    updateRecorderUI();

    const replayStart = performance.now();

    try {
        while (queue.length > 0) {
            const beat = queue.shift();

            const elapsed = performance.now() - replayStart;
            const delay = Math.max(0, beat.time - elapsed);

            await new Promise((resolve) => {
                setTimeout(resolve, delay);
            });

            // Không await âm thanh để các tiếng vẫn có thể chồng nhau.
            playSound(beat.src);
        }
    } finally {
        replaying = false;
        updateRecorderUI();
    }
});

updateRecorderUI();