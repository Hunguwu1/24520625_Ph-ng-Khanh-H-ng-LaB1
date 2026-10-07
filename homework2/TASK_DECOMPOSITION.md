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