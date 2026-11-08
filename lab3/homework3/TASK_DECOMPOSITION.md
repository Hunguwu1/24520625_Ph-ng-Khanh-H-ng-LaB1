# Task Decomposition — HW3 Lab 3

Recorded on November 8, 2026. This is a retrospective mapping of the implementation to real Git history, followed by current uncommitted work. It is not evidence that a WBS existed before implementation.

Scope: KRAFTON x PUBG Vietnam Arena only. WBS identifiers match [WBS.md](WBS.md). Project constraints are in [project-rules.md](project-rules.md).

## Implementation and commit mapping

| WBS | Task and deliverable | Acceptance check | Status / actual commit |
| --- | --- | --- | --- |
| 1.1 | Preserve Lab 2 starting project | Inherited files available for reference | Committed: `98244e3` |
| 1.2 | Configure React 19 and JSX entry | `main.tsx` mounts App with createRoot | Committed: `1f4733f` |
| 1.3 | Define PUBG domain and demo data | Typed drops and four squad standings | Committed: `6d891f7` |
| 2.1 | Build epoch-based countdown hook and drop cards | Nonnegative remaining time; visibility resync; cleanup | Committed: `6d7f150` |
| 2.2 | Preserve schedule across reloads | Five elapsed seconds remain elapsed after reload | Committed: `629ed4d` |
| 3.1 | Implement mock claim API | Success, simulated 409, and simulated network failure | Committed: `367c68d` |
| 3.2 | Implement optimistic claim state | Immediate lock, optimistic decrement, single rollback | Committed: `b78844c` |
| 3.3 | Correct final-unit pending status | Pending status until confirmation; sold out after success | Committed: `3b463b3` |
| 4.1 | Build searchable/sortable leaderboard | Filter by name; three descending sort choices | Committed: `198fc09` |
| 4.2 | Add squad-filtered kill-feed | Match killer or victim squad | Committed: `7b0f154` |
| 4.3 | Virtualize kill-feed | Render a bounded window with fixed-height rows | Committed: `d4eb24f` |
| 5.1 | Fix mobile page overflow | Document scroll width equals viewport at 375px | Committed: `8ce2b37` |
| 5.2 | Add explicit useId labels, contrast and focus improvements | Five matching label/control pairs; Lighthouse A11y 100; keyboard scroll | Committed: `1066617` |
| 5.3 | Remove HTML insertion sinks; enable strict typing; add escaping test | No listed legacy APIs/sinks; strict build; HTML payload is escaped | Committed: `672bd37` |
| 6.1 | Document three verified AI-related bugs | Reproduction, causes, fixes, screenshots and DOM/CDP data | Committed: `8ce2b37`, `6f72407`; fixes mapped above |
| 6.2 | Record rules, decomposition, and WBS | All three documents exist and reference actual work | Included with this documentation commit; locate with `git log --oneline -- project-rules.md TASK_DECOMPOSITION.md WBS.md` |

## Dependencies and work order

1. Establish the React entry and domain data (1.1–1.3).
2. Build timer and claim workflows (2.1, 3.1–3.2), then leaderboard and feed (4.1–4.3).
3. Reproduce real defects and apply focused fixes (5.1, 2.2, 3.3).
4. Validate accessibility and security changes (5.2–5.3).
5. Record evidence and keep traceability documents current (6.1–6.2).

## Verification evidence

- [AI failure audit](AI_FAILURE_AUDIT.md): three Lab 3 defects and their verification limits.
- [Accessibility review](docs/audit/ACCESSIBILITY_REVIEW.md): 100/100 Lighthouse, explicit labels, viewport and keyboard checks.
- [Code quality/security review](docs/audit/CODE_QUALITY_SECURITY_REVIEW.md): sink removal, strict typing, and escaping regression.
- `npm.cmd test`: latest run passed five tests, including four inherited backend tests and one React HTML-escaping test.
- `npm.cmd run build`: latest run passed frontend/server checking and production build.

Existing browser scripts cover selected scenarios, not every requirement above. In particular, source review of timer cleanup and filter/sort behavior is not a claim of exhaustive automated coverage.

## Remaining delivery work

- Accessibility and security changes have separate commits, mapped above.
- These traceability documents are delivered together with the audit clarification.
- Verify commit IDs in the published repository when transferring history; cherry-picking changes hashes.
- Confirm the published directory and remote branch after pushing.
