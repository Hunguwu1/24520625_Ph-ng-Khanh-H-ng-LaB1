# Project Rules — HW3 Lab 3

## Scope and provenance

This project implements the KRAFTON x PUBG Vietnam Championship and Airdrop Arena using React 19, TypeScript, and Vite. These rules were documented on November 8, 2026, after the initial implementation; they describe the current requirements and ongoing maintenance rules, not a preserved original planning document.

The active entry is `index.html` → `src/main.tsx` → `src/App.tsx`. The Node/SQLite flash-sale backend and `src/main.ts` are inherited Lab 2 code. The PUBG React claim API is currently a local simulation; do not describe it as a live backend integration.

## React and state

- Use function components, hooks, `createRoot`, and the automatic JSX runtime.
- Do not use class components, `ReactDOM.render`, `defaultProps`, `keyCode`, or `alert()`.
- Keep state updates immutable. Use functional setters when the next value depends on the previous value. Never sort a shared data array in place.
- Derive filtered lists, rankings, and display phases from source data and state.
- Use stable item keys and clean up timers and event listeners in effects.
- Keep TypeScript strict checking enabled. Treat external data as untrusted and validate it before relying on it.

## Required behavior

- Calculate countdowns from a target epoch and current time; never decrement a stored counter to measure elapsed time.
- Resynchronize the countdown when the document becomes visible. Reloading must preserve the local demo schedule when storage is available.
- Guard claims immediately with an in-flight lock, disable the button while pending, decrement stock optimistically, and roll back once on failure.
- Prevent claims before the opening time and when stock is zero. Show a pending confirmation state before declaring the final unit sold out.
- Support leaderboard search and descending sorting by WWCD, placement points, and kill points, with deterministic ties and an empty-result message.
- Filter kill-feed events by killer or victim squad. Virtualize the list with consistent row geometry and bounded rendered rows.
- Format prices with `Intl.NumberFormat` for Vietnamese VND.

## Responsive and accessibility requirements

- No horizontal overflow of the whole page at 375px. Wide tables may scroll within a keyboard-accessible, named region.
- Use semantic landmarks, headings, articles, and table elements. Use layout wrappers only where needed; avoid div soup.
- Give every input/select/textarea a unique ID generated with `useId()` and a matching `label htmlFor`.
- Preserve keyboard navigation, visible focus, readable contrast, and accessible status messages.
- Target 100 Lighthouse Accessibility. Record the report and manually check keyboard behavior; do not treat the score as complete WCAG 2.2 AA certification.

## Security requirements

- Render untrusted text through JSX or `textContent`. Do not use raw HTML insertion, `dangerouslySetInnerHTML`, `eval`, or `new Function`.
- Never accept unvalidated user-controlled navigation URLs or executable content.
- Keep backend request validation, bounded request bodies, bound SQL parameters, JSON responses, and generic public internal-error messages.
- Do not commit credentials or claim that mock identity, local storage, or simulated API responses provide production authentication or authoritative shared inventory.

## Verification and Git

- Run `npm.cmd test` and `npm.cmd run build` for code changes. Run relevant browser checks when changing layout, labels, timers, or claims.
- Save reproducible evidence under `docs/audit/`. Explain mock responses, controlled clocks, and other test limits.
- Keep at least three genuine Lab 3 bugs in `AI_FAILURE_AUDIT.md`, with reproduction steps, expected/observed behavior, cause, fix, evidence, and lessons. Attach AI conversation excerpts when authorship evidence is required; never invent incidents.
- Maintain `TASK_DECOMPOSITION.md` and `WBS.md` with actual status and verified commit IDs.
- Prefer small, independently reviewable commits with Conventional Commit messages. Do not rewrite history to fabricate a development sequence.
- The rubric requires at least 6–8 atomic commits. Distinguish local changes, committed work, and work pushed to a remote.

## Current limitations

The PUBG claim API, standings, and kill-feed are demos. The persisted schedule does not persist stock or claims. Existing SQLite tests cover the inherited backend rather than a PUBG network API. See the audit reviews for exact evidence and limitations.
