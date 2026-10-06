HW1 Task Plan

## Goal

Build a personal portfolio with an introduction, skills, projects, a contact form, and a light/dark theme. Use only HTML, CSS, and JavaScript.

Write this plan before using AI. All tasks below are planned, not finished.

## Build the Website

If you already have the Exercise 2 portfolio, check and improve it.

| Step | What to Do | Commit Message |
| --- | --- | --- |
| 1 | Write the project rules and this plan. | docs(spec): define portfolio plan |
| 2 | Build the HTML. Use meaningful tags, no div, one h1, labels, and a skip link. | feat(html): semantic landmark tree |
| 3 | Add CSS color variables and border-box sizing. | feat(css): tokens and reset |
| 4 | Add Flexbox and Grid. Check that the page fits a 375px screen. | feat(css): responsive grid |
| 5 | Add light/dark mode. Save it with the localStorage key theme and update the button state. | feat(js): dark mode engine |
| 6 | Add form validation and clear messages. Say it is a demo if it cannot send messages. | feat(form): add form validation |

## Finish the Four HW1 Checks

Make at least one separate commit for each check below.

| Check | What to Test | Commit Message |
| --- | --- | --- |
| M1: Accessibility | Check headings, labels, image text, focus, and WCAG 2.2 AA. Normal text contrast must be at least 4.5:1 in both themes. | fix(a11y): contrast & landmarks |
| M2: Keyboard | Use Tab, Shift+Tab, and Enter to move around the page. Check the skip link and make sure focus never gets stuck. | fix(nav): keyboard trap prevention |
| M3: Security | Add CSP. Remove onclick and other inline handlers. Check that features work without console errors. | fix(security): add CSP and remove inline handlers |
| M4: Performance | Optimize images. Aim for zero CLS, LCP below 2 seconds on Fast 3G, and Lighthouse 100. Save the real results. | perf: optimize assets |

## Work One Step at a Time

1. Choose one step. Tell AI only what that step needs.
2. Review the code and test it with Live Server.
3. Save the test results, commit the changes, and mark the step as finished.

Include the code, needed images, these two files, a README with run instructions, and test results in docs/audits/. Do not include passwords or temporary files.

Save each Lighthouse category score because the assignment does not name a specific category. If a check finds no problem, commit the test notes instead of inventing a fix.
