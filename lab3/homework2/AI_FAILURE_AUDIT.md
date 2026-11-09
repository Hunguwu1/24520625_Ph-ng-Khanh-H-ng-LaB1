# AI Failure Mode Audit — Homework 2 Piano

Verification date: 8 November 2026. Scope: lab3/homework2.

## Method and provenance

This audit documents three application defects reviewed and corrected with AI assistance during the current working session. The baseline is the actual historical commit **dd2bc9258fdfb9d4c2832fbba95c2d49add96c86**, which predates the fixes. No defects were inserted into the baseline to manufacture evidence. Git does not preserve complete prompts or the provenance of every line; this audit therefore does not claim to prove that AI originally introduced all three historical defects. The failure modes describe an analysis of the omissions, rather than quotations from recorded prompts.

`npm run audit:verify` exports the tracked baseline files into a temporary directory, serves the historical and current versions through two local servers, and compares them using the same Chrome browser at 375 × 812. Assertions verify both reproduction before the fixes and correction afterward, while checking that all 88 keys remain present. The script does not check out or reset the working tree.

Evidence:

The published repository contains the same baseline project tree in cherry-picked commit **082f03419c209c5dc8370a010957a5bdbf496a6d**. The verification script uses that commit when the original baseline is unavailable in a fresh clone. Both baseline project trees were compared before publication.

- [Verification script](tests/verify-ai-audit.mjs)
- [Measured JSON results](reports/ai-audit/verification.json): UTC timestamp, browser version, baseline, and fixed-source commit.
- [Before screenshot](reports/ai-audit/before.png) and [after screenshot](reports/ai-audit/after.png).
- [Lighthouse Accessibility: 100/100](reports/lighthouse-375.report.html). This score does not replace the individual defect checks below.

## BUG-01 — Releasing Enter stops a note while Space is still held

**Category:** keyboard interaction and state. **Severity:** medium.

**Location:** src/components/PianoKey.jsx, onKeyDown/onKeyUp.

**Reproduction:** focus C4 using Tab; hold Space; press Enter; release Enter without releasing Space.

**Expected:** the note and aria-pressed remain active until Space is released. **Historical behavior:** aria-pressed becomes false as soon as Enter is released; the JSON records `before.pressedWhileSpaceHeld=false`.

**Root cause:** every keyup calls onNoteOff without tracking other activation sources that remain held. Failure mode: handling each event independently while overlooking overlapping interactions.

**Fix:** track held Space/Enter keys in a Set stored in a ref; stop the note only when no activation key or pointer remains active; clear the tracking state on blur. Commit **189fd0e**.

**Verification after the fix:** `after.pressedWhileSpaceHeld=true` and `after.releasedAfterBothUp=true`. The screenshots capture the state while Space remains held, allowing comparison of C4's highlight. The script verifies UI state; it does not measure audio waveforms.

**Prevention:** test overlapping activation sources instead of testing only isolated press/release sequences.

## BUG-02 — The keyboard requires horizontal scrolling at 375px

**Category:** failure to meet the strict interpretation of the rubric's “zero horizontal scroll” requirement. **Severity:** medium.

**Location:** src/App.css (.piano-scroll, .piano-keyboard), src/App.jsx.

**Reproduction:** open the page at 375 × 812; measure clientWidth and scrollWidth for the document and its child regions.

**Expected:** no region requires horizontal scrolling, and all 88 keys remain accessible. **Historical behavior:** .piano-scroll has clientWidth=341px and scrollWidth=2288px. The document itself remains 375px wide; this is not reported as page-level overflow. If the grader permits scrolling within the keyboard, this defect represents a difference from the stricter interpretation adopted for this project.

**Root cause:** 52 white keys × 44px combined with overflow-x:auto. Failure mode: choosing a convenient layout without validating the required output at 375px.

**Fix:** group octaves using fieldset/legend, allow CSS grid to wrap, and calculate key widths relative to each group; use fixed table layout and text wrapping for the recording table. Content is not concealed using overflow-x:hidden. Commit **578eb67**.

**Verification after the fix:** `after.pageWidth=375`, `after.horizontalOverflow=[]`, and `after.keyCount=88`. See the full-page before/after screenshots.

**Prevention:** measure both the document and child regions, count all keys, and also check the expanded recording table.

## BUG-03 — Vietnamese content declares English as the document language

**Category:** document language mismatch, affecting language selection by assistive technology. **Severity:** medium.

**Location:** index.html, the html element's lang attribute.

**Reproduction:** open the page, read document.documentElement.lang, and compare it with the Vietnamese heading and instructions.

**Expected:** vi. **Historical behavior:** en; the JSON records `before.language=en`.

**Root cause:** retaining template metadata after replacing the content. Failure mode: checking only that lang exists while overlooking whether its value is correct.

**Fix:** set lang="vi" and give the document a descriptive application title. Commit **1be8491**.

**Verification after the fix:** `after.language=vi`; the assertion passes. Listening tests with an actual screen reader have not been performed.

**Prevention:** review language and title when adapting a template; do not use Lighthouse scores as the sole evidence of language correctness.

## Related changes

The playback-speed selector previously had a valid wrapping label but did not satisfy the rubric's htmlFor + useId() requirement. This was corrected in 578eb67; explicitLabels changes from false to true in the JSON. It is not described as a missing accessible name and is not counted as a fourth defect.

Updated rules are in [project-rules.md](project-rules.md), with task breakdowns in [TASK_DECOMPOSITION.md](TASK_DECOMPOSITION.md) and [WBS.md](WBS.md). These documents were added or updated after the review and were not backdated. Lighthouse 100 does not certify full WCAG conformance. React Profiler evidence is still absent from the project directory.

## Atomic commits

Inspect the history using `git log --oneline -- .` from the project directory and `git show --stat <hash>`. Each commit has a purpose tied to a concrete result; one feature may require changes to several files and accompanying tests.

| Commit | Purpose |
| --- | --- |
| ed2f731 | Initialize React + Vite |
| c79b42b | Generate data for 88 keys |
| c9e8f39 | Implement the keyboard, audio, and FIFO voice stealing |
| fb623f7 | Record notes with onset timing and duration |
| d6ab211 | Implement playback, speed control, and cancellation |
| d77b18e | Shape the timbre and decay |
| dd2bc92 | Add the WBS and task decomposition |
| 189fd0e | Fix overlapping activation keys |
| 1be8491 | Correct the document language and title |
| 578eb67 | Implement responsive reflow and the speed-selector label |
| c61d5d0 | Define project rules and AI verification requirements |

More than eight commits concern this project; no empty commits or history rewriting were needed. The subsequent audit commit contains the verification script, results, and documentation; its hash can be inspected in git log. Only homework2 paths were staged, without including changes from other assignments.

## Reproduction commands

```powershell
npm ci
npm test
npm run build
npm run lint
npm run audit:verify
```

The audit requires Git history containing the baseline and an installed Chrome/Edge browser; set CHROME_PATH if the browser is located elsewhere. Running the audit updates the screenshots and JSON, keeps the baseline fixed, and records the current HEAD in the results. Preserve the baseline history when transferring the repository.
