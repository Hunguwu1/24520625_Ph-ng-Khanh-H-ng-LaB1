# Task Decomposition — Lab 3 HW 1: Production Studio Drum Kit

Translation updated: 9 November 2026. Initial test results were recorded on 6 November 2026; build and lint were rerun before publication on 8 November 2026. The final automated checks and AI audit were completed on 9 November 2026.

This document breaks down tasks by inputs, implementation steps, outputs, dependencies, and verification criteria. The overall work structure is in [WBS.md](./WBS.md). Status statements describe the available source code and evidence; they do not certify WCAG conformance.

## T-01 — Investigation and initialization

- **WBS:** 1.1–1.2.
- **Objective:** create a new project based on the previous Drum Kit functionality and the accessibility techniques from Lab 2.
- **Inputs:** the assignment screenshot, Lab 1 Drum Kit, and Lab 2 HW 1 DataGrid.
- **Implementation:** inspect both assignments; define scope; scaffold React and TypeScript with Vite; install dependencies; configure CSS and development commands.
- **Outputs:** a project containing `src/main.tsx`, `src/App.tsx`, `package.json`, and Vite/TypeScript configuration files.
- **Verification:** `npm run dev` opens the application; employee-table navigation logic is not carried into the pad region.
- **Dependencies:** none.
- **Status:** complete.

## T-02 — Data definitions and audio preparation

- **WBS:** 2.1–2.2.
- **Objective:** use one consistent data structure to render buttons and map keyboard shortcuts.
- **Contract:** `DrumPad` contains `id`, `name`, `key`, `code`, and `src`; IDs and codes are unique; each source points to a real file in `public/sounds`.
- **Implementation:** retain the three existing WAV files; add four MP3 files; record sources and attribution; create the code-to-pad Map outside the component.

| Key | event.code | Pad | File |
|---|---|---|---|
| W | KeyW | Tom 1 | `/sounds/tom1.mp3` |
| A | KeyA | Kick | `/sounds/kick.wav` |
| S | KeyS | Snare | `/sounds/snare.wav` |
| D | KeyD | Hi-hat | `/sounds/hihat.wav` |
| J | KeyJ | Tom 2 | `/sounds/tom2.mp3` |
| K | KeyK | Crash | `/sounds/crash.mp3` |
| L | KeyL | Ride | `/sounds/ride.mp3` |

- **Outputs:** the type in `useDrumKeyboard.ts`, the pads array in `App.tsx`, seven audio files, `CREDITS.md`, and `UPSTREAM-README.md`.
- **Verification:** all seven files load and decode; their durations exceed zero; WAV/MP3 extensions remain correct.
- **Dependencies:** T-01.
- **Status:** all seven samples are present. `CREDITS.md` and `UPSTREAM-README.md` were restored on 8 November 2026. This document does not independently establish the provenance of the original WAV files.

## T-03 — Interface and button interaction

- **WBS:** 2.3 and part of 6.1.
- **Objective:** support mouse, Tab, Enter, and Space interaction.
- **Implementation:** render pads with map; use `button type="button"`; display names and shortcut keys; share `triggerPad(pad)`; provide headings and labels for interface regions.
- **Outputs:** the interface in `App.tsx` and its CSS.
- **Verification:** seven pads are present; each button obtains its accessible name from its content; native Enter/Space activation is retained. T-14 adds a guard against repeated native activation while a key is held.
- **Dependencies:** T-02.
- **Status:** complete.

## T-04 — Keyboard hook and input isolation

- **WBS:** 3.1–3.4.
- **Objective:** use physical key codes and prevent unintended drum hits.
- **Contract:** `useDrumKeyboard(padMap, onTriggerPad, isEnabled)` registers keydown when enabled, passes the matching pad to the callback, and removes the listener during cleanup.
- **Implementation sequence:**
  1. Ignore `event.repeat`, IME composition, and Ctrl/Alt/Meta combinations.
  2. Ignore targets in input, textarea, select, or contenteditable regions.
  3. Look up the pad using `event.code`.
  4. Call preventDefault only for a matching pad.
  5. Invoke the activation callback; provide an enable/disable switch and matching aria-keyshortcuts.
- **Outputs:** `src/useDrumKeyboard.ts`, shortcut toggle state, and the note field in `App.tsx`.
- **Verification:** all seven keys map correctly; holding a shortcut does not repeat hits; text entry does not activate pads; buttons remain usable when shortcuts are disabled.
- **Dependencies:** T-02, T-03.
- **Status:** automated checks pass. The composition guard is verified in T-14; testing with a real UniKey session remains part of T-12.

## T-05 — Audio engine and caching

- **WBS:** 4.1–4.3.
- **Objective:** share the playback signal between the speakers and meter while allowing overlapping sounds.
- **Contract:** `useDrumAudio()` returns `playSound(src)`, `levelDb`, and `audioError`. `playSound` handles errors internally; it does not return a boolean as the previous assignment's engine did.
- **Implementation:** create AudioContext on interaction; resume it; fetch and decodeAudioData; cache Promises by source; create a separate AudioBufferSourceNode for each hit; connect source → analyser → destination.
- **Lifecycle management:** remove rejected cache entries to allow retry; ignore completed loads if the engine has changed; disconnect ended sources; close the context and clear the interval during cleanup.
- **Outputs:** `src/useDrumAudio.ts`; App invokes `void playSound(pad.src)`.
- **Verification:** samples decode, the meter receives a signal, and the successful playback flow produces no console errors.
- **Dependencies:** T-02, T-03.
- **Status:** implementation complete. Not every failure branch has been tested individually, and overlapping playback has not been assessed by listening on physical hardware.

## T-06 — Pad state and visual feedback

- **WBS:** 5.1.
- **Objective:** visually identify a recently activated pad.
- **Implementation:** store activePads; add the pad ID on a hit; update aria-pressed; style the true state; assign each pad a separate 150 ms timer; cancel its previous timer on another hit; clear timers on unmount.
- **Outputs:** state, timer refs, and triggerPad in `App.tsx`; state styling in `App.css`.
- **Verification:** pads activate and deactivate; one pad does not clear another pad's state; hitting the same pad resets its feedback interval.
- **Dependencies:** T-03, T-04.
- **Status:** implemented; automated checks confirm basic activation and deactivation.

## T-07 — Hit history and live output

- **WBS:** 5.2.
- **Objective:** provide a text history and announce updates to assistive technology.
- **Implementation:** increment a counter; store each hit's ID and name; prepend the latest hit; use slice to retain ten entries; show the latest hit in output with aria-live polite and aria-atomic true.
- **Outputs:** output and the history list in `App.tsx`.
- **Verification:** retain the ten newest hits in order; repeated hits on the same pad still increment the counter; typing notes does not change history.
- **Dependencies:** T-06.
- **Status:** data updates pass automated checks; actual NVDA announcements remain part of T-12.

## T-08 — Real signal-level meter

- **WBS:** 5.3.
- **Objective:** display the level of the actual playback signal rather than simulated values.
- **Implementation:** sample analyser time-domain data every 50 ms; calculate RMS; convert to dBFS with `20 * log10(RMS)`; clamp to -60 through 0; update the meter and numeric text.
- **Outputs:** levelDb in the hook and a labeled, described meter in App.
- **Convention:** -60 is the display floor; this is not an environmental noise measurement; values above zero are capped at zero. Return to the floor when the context is not running.
- **Verification:** playing Crash raises the meter above -60; the meter returns to -60 after the signal ends; continuously changing values do not receive aria-live announcements.
- **Dependencies:** T-05.
- **Status:** complete and verified automatically.

## T-09 — Focus, colors, layout, and metadata

- **WBS:** 6.1–6.4.
- **Objective:** provide a clear, navigable interface and accurate page metadata.
- **Implementation:** visible focus outlines for pads, inputs, and links; readable link colors on the dark background; flex-wrap for pads; a responsive meter; lang vi; a suitable title and description; valid robots.txt. Explicit control labels and useId are covered by T-14.
- **Outputs:** `App.css`, `index.css`, `index.html`, and `public/robots.txt`.
- **Verification:** Tab/Shift+Tab, Enter/Space, and leaving the pad region; axe contrast checks; no horizontal overflow at 320/375/390/640 px; desktop/mobile screenshot review.
- **Dependencies:** T-03, T-06–T-08.
- **Status:** complete within automated checks and screenshot review; actual browser zoom remains untested.

## T-10 — Functional checks and screenshots

- **WBS:** 7.1–7.2 and part of 8.1.
- **Objective:** provide repeatable checks for important functionality.
- **Implementation:** run the production build on preview; use Playwright with Chrome; decode samples; exercise shortcuts, repeat handling, input isolation, the toggle, pads, history, meter, and focus; record console errors; run axe; capture desktop, mobile, and reflow screenshots.
- **Outputs:** `artifacts/tools/check-app.mjs`, result JSON files, and screenshots in artifacts.
- **Verification:** every result group has passed=true; no pageerror or audio errors occur during successful playback flows.
- **Dependencies:** T-04–T-09.
- **Status:** initially passed on 6 November 2026 and rerun successfully on 9 November 2026. Simulated key/code events are not reported as real UniKey testing.

## T-11 — Build, lint, and Lighthouse

- **WBS:** 7.3–7.4.
- **Objective:** confirm that the application builds, passes lint, and has a recorded Lighthouse measurement.
- **Implementation:** run build and lint; run mobile Lighthouse against preview; correct detected issues; rerun after fixes; retain reports for the final version.
- **Outputs:** `artifacts/tools/run-lighthouse.mjs`, `lighthouse-report.html`, and `lighthouse-report.json`.
- **Recorded results:** Performance 100, Accessibility 100, Best Practices 100, SEO 100; build and lint succeed.
- **Dependencies:** T-09, T-10.
- **Status:** initially passed on 6 November 2026 and rerun successfully on 9 November 2026. Performance recommendations remain in the report.

## T-12 — Manual testing and WCAG review

- **WBS:** 7.5–7.8 and 8.3.
- **Objective:** cover checks that Lighthouse and simulations cannot establish.
- **Dependencies:** T-10, T-11.
- **Status:** direct manual testing has not been completed.

| Group | Procedure | Expected result | Planned evidence |
|---|---|---|---|
| UniKey | Enable Vietnamese/Telex; play all seven shortcuts outside text fields; type Vietnamese notes; disable shortcuts | Physical codes select the correct pads; typing notes does not play sounds | `artifacts/unikey-test.mp4` and test notes |
| NVDA | Tab through the toggle, pads, notes, and links; use Enter/Space; hit a pad and wait for live output | Clear names and states; usable controls; appropriate history announcements | `artifacts/nvda-speech-viewer.png` and test notes |
| Shortcuts with NVDA | Test in interaction mode; distinguish letter keys used by browse mode | NVDA navigation is not mistaken for application shortcut failures | Record the NVDA mode in test notes |
| Actual 200% zoom | Change browser zoom, use all features, and inspect focus | No lost content or controls; no overlapping text | `artifacts/zoom-200-percent.png` |
| Listening test | Listen to every pad; hit the same pad and different pads rapidly | Correct samples, overlapping playback, no unexpected interruption | Results and playback device details |
| WCAG A/AA | List every applicable criterion; assess page states; explain non-applicable criteria | Each criterion has a result, evidence, or an issue to fix | WCAG evaluation table in the manual report |

The filenames in this table are planned outputs, not existing evidence. After testing, record the environment, tool versions, steps, expected behavior, and actual results in `artifacts/manual-test-results.md`. Fix any discovered issues and retest affected behavior.

## T-13 — Documentation and handoff

- **WBS:** 8.1–8.3.
- **Objective:** let the recipient understand setup, features, results, and remaining verification gaps.
- **Implementation:** retain reports and screenshots; prepare the WBS and task decomposition; link audio credits; update status after manual testing.
- **Available outputs:** README.md, WBS.md, TASK_DECOMPOSITION.md, artifacts/verification.md, JSON/HTML/PNG evidence, and two audio attribution files in `public/sounds`. T-14 adds project rules and the AI failure audit.
- **Completion criteria:** evidence matches the final code; manual tests are not marked passed before execution; any claim of WCAG 2.2 AA conformance requires a complete assessment of applicable criteria.
- **Dependencies:** T-11; full acceptance also depends on T-12.
- **Status:** documentation, source attribution information, and automated evidence are complete; manual results remain pending.

## Dependency flow

```text
T-01 → T-02 → T-03 → T-04
                  ├→ T-05 → T-08
                  └→ T-06 → T-07
T-03 through T-08 → T-09 → T-10 → T-11 → T-12 → finalize T-13
```

These steps describe logical dependencies, not a claim about parallel execution or time spent.

## T-14 — Verified AI failure audit and commit delivery

- Preserve baseline commit 067e2d3; reproduce faults against its original App and keyboard hook before applying corrections.
- Verify three cases: the explicit-label/useId contract, IME composition isolation, and held Enter on a focused pad.
- Correct each concern independently; run the same regression assertions against the final application.
- Save baseline and final JSON evidence, exact commands, root causes, and limitations in AI_FAILURE_AUDIT.md.
- Deliver at least eight focused follow-up commits on codex/drumkit-verified-audit. These are present-day improvements, not a reconstruction of the original implementation history.
- Run build, lint, functional browser checks, and Lighthouse after the final code changes.
- **Status:** the three baseline failures were reproduced, all three pass after correction, and the eight original audit follow-up commits were created. Subsequent documentation translations preserve that history.
