// recorder.js

const beats = [];

let recording = false;
let recordingStart = 0;

export function startRecording() {
    if (recording) return;

    beats.length = 0;
    recordingStart = performance.now();
    recording = true;
}

export function stopRecording() {
    recording = false;
}

export function isRecording() {
    return recording;
}

export function recordBeat(key, src) {
    if (!recording) return;

    beats.push({
        key,
        src,
        time: performance.now() - recordingStart,
    });
}

export function getBeats() {
    return beats.map((beat) => ({ ...beat }));
}