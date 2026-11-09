import { memo, useRef } from 'react';

const PianoKey = memo(function PianoKey({
  midi, noteName, isBlack, position, isPressed, onNoteOn, onNoteOff, disabled = false,
}) {
  const pointerId = useRef(null);
  const heldKeys = useRef(new Set());

  function releasePointer(event) {
    if (pointerId.current !== event.pointerId) return;
    pointerId.current = null;
    if (heldKeys.current.size === 0) onNoteOff(midi);
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={`piano-key ${isBlack ? 'key-black' : 'key-white'}${isPressed ? ' is-pressed' : ''}`}
      style={{ left: `calc(var(--white-width) * ${position})` }}
      aria-label={noteName}
      aria-pressed={isPressed}
      title={noteName}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        if (!isPressed) {
          pointerId.current = null;
          heldKeys.current.clear();
        }
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
        if (event.repeat) return;
        if (!isPressed) heldKeys.current.clear();
        heldKeys.current.add(event.key);
        onNoteOn(midi);
      }}
      onKeyUp={(event) => {
        if (event.key !== ' ' && event.key !== 'Enter') return;
        event.preventDefault();
        heldKeys.current.delete(event.key);
        if (heldKeys.current.size === 0 && pointerId.current === null) onNoteOff(midi);
      }}
      onBlur={() => {
        pointerId.current = null;
        heldKeys.current.clear();
        onNoteOff(midi);
      }}
    >
      <span>{noteName}</span>
    </button>
  );
});

export default PianoKey;
