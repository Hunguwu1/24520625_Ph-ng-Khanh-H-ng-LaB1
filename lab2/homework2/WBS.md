# Work Breakdown Structure (WBS)

**Project:** Concurrent FIFO Audio Visualizer Queue Engine  
**Time frame:** One week  
**Goal:** Build a browser application that loads and decodes audio concurrently, plays tracks in FIFO order, visualizes frequency data, and cleans up audio resources.

Status key: **Done** = implemented or documented; **To verify** = requires browser measurement or final evidence.

| WBS ID | Work package | Deliverable / acceptance criterion | Status |
| --- | --- | --- | --- |
| **1.0** | **Project foundation** | Runnable TypeScript and Vite application. | **Done** |
| 1.1 | Set up the project | Dependencies install; development server and production build run. | Done |
| 1.2 | Prepare test audio | A valid local MP3 is available at `public/audio/test.mp3`. | Done |
| 1.3 | Define track data | Track IDs, URLs, statuses, cancellation signals, and audio buffers have shared types. | Done |
| **2.0** | **Concurrent FIFO loading pipeline** | Tracks are fetched and decoded with controlled concurrency. | **Done** |
| 2.1 | Build the task queue | New tasks enter at the end; waiting tasks start from the front. | Done |
| 2.2 | Limit concurrent work | No more than two fetch/decode tasks run at once. | Done |
| 2.3 | Fetch and decode audio | Successful responses become `AudioBuffer` objects; HTTP and decode failures are reported. | Done |
| 2.4 | Add cancellation | `AbortController` cancels pending or active fetches; results from a cancelled decode are discarded. | Done |
| **3.0** | **FIFO playback engine** | Playable tracks start in the order they were added. | **Done** |
| 3.1 | Manage the audio context | Create and resume `AudioContext` for audio work and playback. | Done |
| 3.2 | Preserve playback order | A later ready track waits for an earlier track that is still loading. | Done |
| 3.3 | Handle completion and errors | Completed, cancelled, and failed tracks do not block later valid tracks. | Done |
| 3.4 | Implement playback controls | Play, stop, cancel, and clear operations update the queue consistently. | Done |
| **4.0** | **Audio visualization** | A Canvas displays live frequency data while audio plays. | **Done** |
| 4.1 | Connect the analyser | `AnalyserNode` uses an FFT size of 512, producing 256 frequency bins. | Done |
| 4.2 | Draw the frequency bars | Reuse one frequency-data array and draw with `requestAnimationFrame`. | Done |
| 4.3 | Stop visual updates | Cancel the animation loop when playback stops, ends, or is cleared. | Done |
| **5.0** | **User interface and cleanup** | Users can inspect and control the queue without stale audio resources. | **Done** |
| 5.1 | Build queue controls | Add URLs, play, stop, cancel waiting tracks, and clear the queue. | Done |
| 5.2 | Show track state | Display queue order, status, and errors for each track. | Done |
| 5.3 | Release playback resources | Stop and disconnect `AudioBufferSourceNode`; clear its buffer reference. | Done |
| 5.4 | Release application resources | Disconnect the analyser, abort remaining tasks, and close `AudioContext` when leaving the page. | Done |
| **6.0** | **Verification and submission** | Evidence that the implementation meets the assignment criteria. | **In progress** |
| 6.1 | Check the production build | `npm run build` completes without TypeScript or Vite errors. | Done |
| 6.2 | Test FIFO and concurrency in Chrome | Observe two loading tracks at most and verify playback order, including when a later track becomes ready first. | To verify |
| 6.3 | Test failure and cancellation | Confirm bad URLs, cancelled tracks, stop, clear, and adding tracks after clear behave correctly. | To verify |
| 6.4 | Measure visual performance | Record FPS while playing; check for sustained dropped frames against the 60 FPS target. | To verify |
| 6.5 | Inspect memory usage | Compare heap snapshots after repeated add/play/clear cycles and investigate retained objects. | To verify |
| 6.6 | Document the project | Provide setup, usage, architecture, and testing guidance in `README.md`. | Done |
| 6.7 | Collect submission evidence | Save screenshots or notes for the browser tests, FPS, and memory observations. | To verify |

## Suggested one-week sequence

| Day | Focus |
| --- | --- |
| 1 | Foundation and shared track types (1.0). |
| 2 | Concurrent loading, decoding, and cancellation (2.0). |
| 3 | FIFO playback engine and controls (3.0). |
| 4 | Frequency visualizer (4.0). |
| 5 | User interface and resource cleanup (5.0). |
| 6 | Functional and performance verification (6.1–6.5). |
| 7 | Documentation, evidence, and final review (6.6–6.7). |

**Completion condition:** The build passes, browser tests confirm FIFO and cancellation behavior, measured rendering performance is acceptable for the 60 FPS target, and repeated-use memory checks show no continuing growth attributable to retained application objects. Implementation alone does not establish a measured FPS or prove the absence of memory leaks.
