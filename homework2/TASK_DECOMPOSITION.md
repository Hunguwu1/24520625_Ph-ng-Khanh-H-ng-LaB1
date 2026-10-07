# HW2 — Task Decomposition

## T-01: HTML and Drum Pad Data Contract

Goal: create the HTML interface before implementing JavaScript.

Rules:
- Each drum pad is a button with type="button".
- Each pad has class="drum-pad".
- data-key contains a unique lowercase keyboard key.
- data-sound contains the relative path to an audio file.
- JavaScript will read these attributes to identify the pad and its sound.
- The page contains one h1, a skip link, and semantic HTML elements. No div elements are used.

Initial mapping:
- a → sounds/kick.wav
- s → sounds/snare.wav
- d → sounds/hihat.wav

Verification:
- Each button displays the correct sound name and keyboard key.
- Every button is reachable using Tab.
- Every data-sound path points to an existing audio file.
- No JavaScript is implemented at this stage.

## T-02: Independent Polyphonic Audio Engine

Goal: implement an independent audio engine that allows multiple drum sounds to overlap.

Files:
- audio-engine.js: audio creation, playback, and playback error handling.
- sounds/kick.wav, sounds/snare.wav, and sounds/hihat.wav: valid, nonempty audio assets.

Interface contract:
- Export an async playSound(src) function from audio-engine.js.
- Accept an audio file path as src; do not hardcode sound mappings inside the engine.
- Create a separate Audio object for each call so new hits do not interrupt existing hits.
- Return a Promise resolving to true when playback starts or false when playback fails.
- Handle rejected play() promises using try/catch.
- Keep DOM selection, click handlers, keyboard handlers, and recording logic outside the engine.
- Awaiting audio.play() waits for playback to start, not for the sound to finish.

Implementation steps:
1. Confirm that the audio assets contain actual playable audio data.
2. Create audio-engine.js and export playSound(src).
3. Create a new Audio(src) object inside the function for each hit.
4. Await audio.play() and return true when playback starts.
5. Catch playback failures, report the cause, and return false.
6. Test the engine independently through the browser Console using Live Server.
7. Keep the engine separate from the controls implemented in T-03.

Acceptance checks:
- Each supplied audio file can be played through playSound(src).
- Starting another sound does not stop an existing sound.
- Repeated calls using the same sound path can overlap.
- A failed playback request returns false without an unhandled Promise rejection.
- The engine contains no DOM queries or UI event listeners.

Implementation commit message:
- feat(js): implement polyphonic audio engine

Verification status:
- The user confirmed audible output from the concurrent Kick, Snare, and Hi-hat test.
- Repeated-hit overlap and failure handling still require separate manual verification.

## T-03: Drum Pad Controls and Keyboard Repeat Filtering

Goal: connect drum pad buttons and keyboard input to the independent audio engine.

Files:
- controls.js: DOM selection, click handlers, and keyboard handlers.
- index.html: load controls.js using a script with type="module".
- audio-engine.js: existing audio playback implementation; imported by controls.js.

Data and interface contract:
- Select drum pads using the .drum-pad class.
- Read the keyboard binding from data-key and the audio path from data-sound.
- Import playSound(src) from ./audio-engine.js.
- playSound(src) returns a Promise resolving to true when playback starts or false when playback fails.
- Route both clicks and valid keyboard events through one triggerPad(pad) function.
- Keep audio creation and playback error handling inside audio-engine.js.
- Do not hardcode keyboard-to-sound mappings in JavaScript.

Implementation plan:
1. Import playSound and select the drum pad buttons.
2. Implement triggerPad(pad) to pass pad.dataset.sound to playSound.
3. Register click handlers with addEventListener.
4. Register a keydown handler using event.key.
5. Ignore events with event.repeat to prevent repeated hits while a key is held.
6. Ignore Ctrl, Alt, and Meta shortcuts and input inside editable fields.
7. Normalize the key to lowercase and find the matching data-key.
8. Ignore unmapped keys; call preventDefault only for a matched drum key.
9. Load controls.js as a module in index.html and verify through Live Server.

Acceptance checks:
- Clicking each drum pad plays its assigned sound.
- Pressing A, S, or D plays the sound defined by the corresponding data-key.
- Shift + A still activates the pad mapped to a.
- Holding a mapped key produces only one hit until the key is released.
- Releasing and pressing the key again produces another hit.
- Unmapped keys do not play sounds or produce errors.
- Typing in an editable field and using Ctrl, Alt, or Meta shortcuts do not activate pads.
- Tab reaches each button, and Enter activates the focused button.
- Multiple drum hits can overlap through the existing audio engine.
- Changing the Kick binding from a to q in HTML works after reload without editing JavaScript.
- No unexpected errors appear in the browser Console.

Planned implementation commit:
- feat(js): bind drum controls with repeat filtering

Verification status: pending manual testing.

## T-04: Timestamped FIFO Beat Recorder

Goal: record drum hit events in chronological order and replay them while preserving their relative timing.

Files:
- recorder.js: recording state, timestamps, event queue, and snapshot access.
- controls.js: record each manual hit and bind recording and replay controls.
- index.html: Record, Stop Recording, Replay, and an accessible status region.

Data and interface contract:
- Each recorded event contains key, src, and time in milliseconds relative to the recording start.
- Use performance.now() to measure elapsed time.
- Append manual hit events using push; replay a copied queue using shift (FIFO).
- Keep recorder.js independent of DOM elements and audio playback.
- Stop Recording preserves the saved events; starting a new recording clears the previous take.
- Replay reads a snapshot and does not consume or append to the saved recording.
- Schedule each replay event relative to one replay start time, without awaiting audio completion.
- Disable Record and Replay during replay; disable Replay during recording or when no events are saved.
- Update status text using textContent.
- Record and Stop implement the required event recorder; Replay is included to demonstrate the saved sequence.

Acceptance checks:
- Record an A, S, D sequence with different pauses and verify the event order and timestamps.
- Both clicks and mapped keyboard hits are recorded.
- Holding a mapped key records only one hit due to T-03 repeat filtering.
- Hits after Stop Recording are not appended.
- An empty recording cannot be replayed.
- Replay preserves event order and approximately preserves pauses without modifying the saved take.
- Replay may be repeated, and replayed hits are not recorded again.
- Starting another recording clears the previous take.
- No unexpected browser Console errors occur.

Timing scope: setTimeout provides approximate foreground replay timing; it is not a sample-accurate audio scheduler.

Planned implementation commit:
- feat(js): add timestamped FIFO beat recorder

Verification status: pending implementation and manual testing.
