const NOTE_NAMES = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
];

export function generatePianoKeys() {
  const keys = [];

  for (let midi = 21; midi <= 108; midi++) {
    const noteIndex = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    const note = NOTE_NAMES[noteIndex];

    keys.push({
      midi,
      noteName: `${note}${octave}`,
      isBlack: note.includes('#'),
      freqHz: 440 * 2 ** ((midi - 69) / 12),
    });
  }

  return keys;
}
