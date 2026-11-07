import { memo, useRef } from 'react';

const PianoKey = memo(function PianoKey({
  midi, noteName, isBlack, position, isPressed, onNoteOn, onNoteOff,
}) {
  const pointerId = useRef(null);

  function releasePointer(event) {
    if (pointerId.current !== event.pointerId) return;
    pointerId.current = null;
    onNoteOff(midi);
  }

  return (
    <button
      type="button"
      className={`piano-key ${isBlack ? 'key-black' : 'key-white'}${isPressed ? ' is-pressed' : ''}`}
      style={{ left: `calc(var(--white-width) * ${position})` }}
      aria-label={noteName}
      aria-pressed={isPressed}
      title={noteName}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        if (!isPressed) pointerId.current = null;
        if (pointerId.current !== null) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        pointerId.current = event.pointerId;
        onNoteOn(midi);
      }}
      onPointerUp={releasePointer}
      onPointerCancel={releasePointer}
      onLostPointerCapture={releasePointer}
      onKeyDown={(event) => {
        if (event.key !== ' ' && event.key !== 'Enter') return;
        event.preventDefault();
        if (!event.repeat) onNoteOn(midi);
      }}
      onKeyUp={(event) => {
        if (event.key !== ' ' && event.key !== 'Enter') return;
        event.preventDefault();
        onNoteOff(midi);
      }}
      onBlur={() => {
        pointerId.current = null;
        onNoteOff(midi);
      }}
    >
      <span>{noteName}</span>
    </button>
  );
});

export default PianoKey;
