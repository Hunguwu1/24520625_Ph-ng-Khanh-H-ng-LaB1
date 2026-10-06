HW1 Task Decomposition

## Goal

Complete a responsive personal portfolio using vanilla HTML, CSS, and JavaScript, then verify the four HW1 milestones. Define tasks before using AI; all tasks below are initially **Planned**.

## Foundation

If the Exercise 2 portfolio already exists, verify and repair it instead of rebuilding it.

| Task | Work and Verification | Suggested Commit |
| --- | --- | --- |
| T-00 | Write project rules and this plan before implementation. | `docs(spec): define portfolio contracts and milestones` |
| T-01 | Build hero, navigation, skills, project articles, contact form, and footer. Verify semantic landmarks, zero divs, one h1, labels, and skip link. | `feat(html): semantic landmark tree` |
| T-02A | Add border-box reset and CSS color tokens for both themes. | `feat(css): tokens and reset` |
| T-02B | Build Flexbox/Grid layouts. Verify visible focus and no horizontal scrolling at 375px. | `feat(css): responsive grid` |
| T-02C | Implement theme switching. Verify localStorage key `theme`, reload persistence, and matching button state. | `feat(js): dark mode engine` |
| T-02D | Add native form validation and safe client-side status. Clearly identify the form as a demo if no backend exists. | `feat(form): add validated client-side status` |

## Required HW1 Milestones

Keep at least four separate milestone commits in addition to foundation work.

| Milestone | Verification | Commit |
| --- | --- | --- |
| M1: Accessibility | Audit WCAG 2.2 AA: landmarks, headings, labels, alt text, focus, and contrast in both themes. Normal text contrast must be at least 4.5:1. | `fix(a11y): contrast & landmarks` |
| M2: Keyboard | Test Tab, Shift+Tab, Enter, skip link, and form. Fix unintended traps; test modal dismissal and focus restoration if applicable. | `fix(nav): keyboard trap prevention` |
| M3: Security | Apply restrictive CSP, remove inline handlers, and verify all features without console errors. | `fix(security): enforce CSP and remove inline handlers` (suggested) |
| M4: Performance | Optimize assets. Target zero CLS, LCP below 2 seconds on Fast 3G, and Lighthouse 100. Save actual scores and test conditions. | `perf: optimize assets` |

## Workflow and Submission

1. Select one task, define its contract, and request only that task from AI.
2. Review the diff and test through a local HTTP server.
3. Record results, commit related changes, and update task status.

Include source files, required assets, these documents, a README with run instructions and limitations, and audit evidence in `docs/audits/`. Exclude secrets and temporary files. Report Lighthouse categories separately because the assignment does not specify which category must score 100. If an audit finds no defect, commit its evidence rather than inventing a fix.

## Progress

- HTML foundation: completed.
- CSS reset and grid foundation: completed.
- Theme and form: verified in Chrome with keyboard input at both tested viewport sizes and themes.
- Portfolio content and layout: pending.
- M1 accessibility: documented source/browser checks pass; Lighthouse Accessibility is 100/100; Narrator spoken-output verification is pending.
- M2 keyboard navigation: completed for the checks documented in the audit.
- M3 CSP: pending.
- M4 performance: pending.
