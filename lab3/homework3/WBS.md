# Work Breakdown Structure — HW3 Lab 3

Recorded on November 8, 2026. Deliverable-based WBS for the current PUBG Arena implementation. This retrospective record shares task IDs with [TASK_DECOMPOSITION.md](TASK_DECOMPOSITION.md), which holds commit mappings and delivery status.

| WBS ID | Work package | Deliverables | Completion criteria |
| --- | --- | --- | --- |
| 1 | Application foundation | React 19 frontend and typed domain | Application mounts through the modern React entry |
| 1.1 | Inherited baseline | Lab 2 source and backend | Starting project retained without representing it as new Lab 3 work |
| 1.2 | React setup | `index.html`, `src/main.tsx`, `src/App.tsx`, JSX settings | createRoot and function components |
| 1.3 | PUBG contracts | `src/domain/pubg.ts`, `src/data/pubgDemo.ts` | Drop and standing models with demo fixtures |
| 2 | Airdrop scheduling | Countdown and persistent local target | Opening time survives ordinary reloads |
| 2.1 | Anti-drift hook | `src/hooks/usePubgAirdropTimer.ts` | Epoch difference, zero clamp, visibility resync, effect cleanup |
| 2.2 | Schedule persistence | `loadDemoDrops()` and App initialization | Reload does not restart the countdown when local storage is available |
| 3 | Claim workflow | Mock API and optimistic UI | Success/failure paths keep local stock coherent |
| 3.1 | Claim simulation | `src/api/pubgClaim.ts` | Controlled success, conflict, and network-error scenarios |
| 3.2 | Optimistic state | `src/components/DropCard.tsx` | In-flight guard, disabled state, decrement, rollback |
| 3.3 | Final-unit state | Pending-confirmation status | Do not declare confirmed sold out while the request is pending |
| 4 | Standings and events | Leaderboard and virtual kill-feed | Users can find squads and inspect matching events |
| 4.1 | Leaderboard | `src/components/Leaderboard.tsx` | Name search, WWCD/placement/kill sorting, empty-result feedback |
| 4.2 | Event filter | `src/components/KillFeed.tsx`, demo events | Include events involving the selected squad |
| 4.3 | Virtual window | `src/components/VirtualList.tsx` | Fixed-height rows, overscan, stable keys, scroll window |
| 5 | Quality gates | Responsive, accessible, and safer source | Required checks and evidence available |
| 5.1 | Responsive layout | Root width constraints and scrollable table | No whole-page overflow at 375px |
| 5.2 | Accessibility | Explicit useId labels, contrast, focus, named scroll region | 100 Lighthouse A11y plus label and keyboard checks |
| 5.3 | Code quality/security | DOM text output, strict TS, escaping regression | No prohibited APIs/HTML sinks found; tests and build pass |
| 6 | Audit and traceability | Verified incidents and Git mapping | Submission documents reflect real evidence |
| 6.1 | Failure forensics | `AI_FAILURE_AUDIT.md`, screenshots, JSON, reproduction scripts | Three actual Lab 3 defects with before/after evidence and fixes |
| 6.2 | Project documentation | `project-rules.md`, `TASK_DECOMPOSITION.md`, `WBS.md` | Consistent scope, acceptance criteria, commit/status mapping |

## Boundaries

This WBS covers HW3 Lab 3 only. It does not claim completion of the other five exercises/homeworks in the overall rubric. It does not include a live PUBG service, authenticated users, payment processing, authoritative cross-client inventory, or a full WCAG/security certification.

## Delivery state

The core implementation, three bug fixes, accessibility and security changes have focused commits. These documents are delivered in a separate documentation commit. See TASK_DECOMPOSITION.md for commit mappings. No estimated hours or historical planning dates are asserted because they were not recorded during the original implementation.
