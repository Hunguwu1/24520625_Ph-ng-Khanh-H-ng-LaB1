# AI_FAILURE_AUDIT — PUBG Vietnam Arena (Lab 3)

## Lab 3 Scope

This report records **3 actual Lab 3 issues**, discovered during interface testing in Chrome on November 8, 2026. All three have fixes in the current source. Historical Lab 2 incidents are not counted as Lab 3 issues.

## Lab 3 — Issue 1: Horizontal Page Overflow on Narrow Screens

**Fix commit:** `2e6a103` — `fix: prevent mobile overflow and document AI failure`.

**AI code provenance.** During the Lab 3 implementation conversation, Codex generated the React interface, leaderboard, and CSS without constraining the width of the root `#app` element. The issue was discovered during browser testing after commit `483614a`. The relevant interface code and the discovery of this issue are recorded in the implementation conversation. This report covers Lab 3 incidents only.

**Reproduction before the fix.** Run `npm.cmd run dev` and open the application in Chrome with a 375px-wide viewport. Open the Console and measure `window.innerWidth` and `document.documentElement.scrollWidth`.

**Expected behavior.** The page fits within the viewport width. If the leaderboard is wider than its container, it scrolls horizontally within `.table-scroll`.

**Observed behavior.** The viewport was **375px** wide, but the page's scroll width was **487px**. Both `#app` and `.arena` were approximately **487.17px** wide, causing horizontal overflow across the page. Screenshot before the fix: [mobile-before.png](docs/audit/mobile-before.png).

**Cause.** The `body` uses CSS Grid and centers its child. Without a width constraint on `#app`, the intrinsic size of its content, including the leaderboard, made the root element wider than the viewport. The percentage width of `.arena` was calculated relative to that root element, so it also expanded. Adding `overflow-x: auto` to the table container alone was insufficient to constrain the page width.

**Fix.** In `src/style.css`, set `#app { width: 100%; min-width: 0; }` so that the root element fits the available width and can shrink. Add `margin-inline: auto` to `.arena` to keep the content centered on larger screens. Keep horizontal scrolling inside `.table-scroll` instead of hiding overflowing page content.

**Verification after the fix.** Test in Chrome with Playwright and measure the DOM directly, in addition to reviewing screenshots:

| Viewport width | Page scroll width after the fix | Result |
| --- | --- | --- |
| 320px | 320px | Pass |
| 375px | 375px | Pass |
| 390px | 390px | Pass |
| 768px | 768px | Pass |
| 1280px | 1280px | Pass |

At a 375px viewport, the table container was 295px wide, while its content was 407px wide and could scroll horizontally inside the container. Additional checks confirmed that the kill-feed filter still returned 50 events when The Expendables was selected. The Virtual List rendered no more than 12 rows, each 72px high, at all five viewport sizes. `npm.cmd run build` succeeded after the fix. These checks used a desktop browser with resized viewports; they were not tests on physical mobile devices.

Evidence: [screenshot after the fix](docs/audit/mobile-after.png), [measurements after the fix](docs/audit/responsive-fixed.json).

**Lesson.** When using Grid/Flex layouts and data tables, check the width of the root element and its containing elements. A successful build and component logic checks do not establish that the interface fits the screen. DOM measurements and tests at multiple viewport sizes are necessary.

## Lab 3 — Issue 2: Reloading the Page Postpones the Airdrop

**Fix commit:** `317a151` — `fix: preserve airdrop schedule across page reloads`.

**AI code provenance.** The defect was found in the existing Codex-generated Lab 3 implementation: `App.tsx` initialized its drops with `createDemoDrops()`, whose default argument was `Date.now()`. The implementation context identifies these files as AI-generated; browser evidence establishes the behavior, not authorship by itself.

**Expected behavior.** The countdown tracks a fixed target epoch. Reloading must not postpone an already scheduled airdrop.

**Reproduction before the fix.** Open the application in a fresh browser context. Wait five seconds after the initial `00:30`, note `00:25`, then reload. The countdown returns to `00:30`. Repeated reloads keep postponing the opening. The automated reproduction uses a controlled browser clock to advance five seconds deterministically.

**Cause.** The hook correctly calculated the difference from its target epoch, but the caller recreated that target on every page load. Correct anti-drift arithmetic could not compensate for a moving target.

**Fix.** Add `loadDemoDrops()` in `src/data/pubgDemo.ts` and use it as the lazy state initializer in `src/App.tsx`. Store the demo start epoch under `pubg-arena-demo-start-v1` in local storage and derive the same drop epochs after reload. Validate the stored epoch and fall back to an in-memory demo if storage is unavailable. Only the schedule is persisted; inventory and claims remain in memory. To intentionally restart this local demo, remove that storage key and reload.

**DevTools proof.** Chrome DevTools Protocol console events and DOM observations are saved in [before-fix JSON](docs/audit/ai-bugs-before.json) and [after-fix JSON](docs/audit/ai-bugs-after.json):

```text
Before fix: beforeReload = "00:25", afterReload = "00:30"
After fix:  beforeReload = "00:25", afterReload = "00:25"
```

Screenshots: [before fix](docs/audit/timer-reload-before.png), [after fix](docs/audit/timer-reload-after.png). For manual DevTools Console inspection, read `document.querySelector('.timer').textContent` before and after reload, and inspect `localStorage.getItem('pubg-arena-demo-start-v1')` after the fix.

**Verification and limits.** Browser assertions check both timer readings using a new context with empty storage for each run. Local storage preserves the schedule within the same browser origin; a production system would obtain a shared schedule from a server. Clearing or disabling storage is outside this persistence guarantee.

**Lesson.** Verify the source and lifetime of the target epoch as well as the hook's arithmetic and visibility-change handler.

## Lab 3 — Issue 3: Optimistic Stock Shows Sold Out Before Confirmation

**Fix commit:** `f6642f0` — `fix: show pending confirmation before declaring drop sold out`.

**AI code provenance.** The defect was found in the existing Codex-generated `src/components/DropCard.tsx`. The optimistic decrement and the phase calculation interacted to expose an unconfirmed terminal status.

**Expected behavior.** While a final-unit claim is pending, display a pending confirmation status and disable duplicate claims. Display sold out after successful confirmation. On failure, restore the unit and live status.

**Reproduction before the fix.** Wait until the VIP ticket opens. Complete nine successful claims, leaving one ticket. Select the simulated 409 conflict and claim the final ticket. During the 1.2-second delay, stock is zero, the button is pending, but the status says sold out. After the simulated rejection, stock returns to one and the card returns to live.

**Cause.** `phase` was derived from optimistic `stock <= 0` before the request resolved. The status text treated that provisional value as a confirmed result even though `pending` was true.

**Fix.** In `src/components/DropCard.tsx`, prioritize the pending status in the countdown status region. While `pending` is true, show a label meaning “Confirming claim”; otherwise show `statusText`. Keep the immediate in-flight lock, optimistic decrement, rollback, and final phase calculation.

**DevTools proof.** The browser check reads the card through Chrome DevTools Protocol `Runtime.evaluate` and records console events through `Runtime.consoleAPICalled`:

| Observation during the final-unit request | Before fix | After fix |
| --- | --- | --- |
| Optimistic stock | 0 | 0 |
| Button | Claiming | Claiming |
| Status | Sold out | Confirming claim |
| Stock after simulated 409 | 1 | 1 |

Evidence: [before-fix JSON](docs/audit/ai-bugs-before.json), [after-fix JSON](docs/audit/ai-bugs-after.json), [before screenshot](docs/audit/last-unit-before.png), [after screenshot](docs/audit/last-unit-after.png). JSON retains original Vietnamese UI strings. For manual Console inspection, evaluate `document.querySelector('.product-card .countdown [role="status"]').textContent` while the final claim is pending.

**Verification and limits.** Browser assertions check stock zero and pending status during the request, rollback to one with the 409 message, and a subsequent successful final-unit claim ending in sold out with the button disabled. The claim API is a local simulation: 409 is a rejected `ClaimError`, not an HTTP response. These artifacts are DevTools Protocol evidence and page screenshots, not screenshots of the DevTools panel or proof of a real backend inventory conflict.

**Lesson.** A terminal status must distinguish provisional optimistic state from a confirmed outcome.

## Lab 3 Verification Summary

At the original verification on November 8, 2026, `npm.cmd test` passed **4 tests with 0 failures**, and `npm.cmd run build` succeeded after both fixes. Those four tests cover the inherited backend; the UI issues are covered separately by the Chrome reproduction script [verify-ai-bugs.mjs](docs/audit/verify-ai-bugs.mjs). A later security update added a fifth test for HTML escaping; the count of four here records the original verification rather than the current suite size.

To rerun the fixed UI checks, install or locate Playwright outside application dependencies, set `PLAYWRIGHT_MODULE` to its absolute `index.mjs` file URL, then run:

```powershell
node docs/audit/verify-ai-bugs.mjs after
```

The script uses installed Google Chrome, a fresh browser context, a controlled clock, assertions, screenshots, and DevTools Protocol evidence collection. The `before` argument asserts faulty behavior and requires the pre-fix source; it intentionally fails against fixed source. Before-fix artifacts were captured before editing the implementation. The responsive issue retains its earlier five-viewport evidence above.

---

