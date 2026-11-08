# HW3 Lab 3 — Responsive and Accessibility Review

Recreated from fresh checks on November 8, 2026. The earlier uncommitted report was missing; this document records the new verification rather than claiming to recover the original artifact.

Tested the React application at `http://127.0.0.1:5173` using installed Google Chrome.

| Rubric item | Result |
| --- | --- |
| No whole-page overflow at 375px | Pass: viewport and document scroll width are both 375px. Also passed at 320, 768, and 1280px. The wide table scrolls within its own container. |
| No div soup | Source uses main/header/section/article, headings, and a semantic table. Remaining divs provide layout, scrolling, and virtual-list geometry; the list exposes list/listitem roles. This is a source-review judgment. |
| Explicit labels and useId | All five input/select controls have unique useId-generated IDs and matching label htmlFor attributes. Label-click focus assertions passed. |
| Lighthouse Accessibility 100 | Pass: 100/100, Lighthouse 13.6.0, default mobile preset, no runtime error. |
| Keyboard interaction | Tab reaches all five input/select controls with visible focus outlines. Table and kill-feed scrolling work with arrow keys. |

## Changes verified

- Explicit label/control pairs in DropCard, Leaderboard, and KillFeed.
- Darker badge/price text and claim-button background.
- Visible focus indicators, explicit control colors, and contrasting borders.
- A named, keyboard-focusable table scroll region.

## Evidence and reproduction

- [Lighthouse HTML report](lighthouse-a11y-fixed.report.html)
- [Lighthouse JSON report](lighthouse-a11y-fixed.report.json)
- [Responsive, label and keyboard assertions](accessibility-checks.json)
- [375px screenshot](accessibility-375px.png)
- [Browser verification script](verify-accessibility.mjs)

Run `npm.cmd run dev`. Set `PLAYWRIGHT_MODULE` to the absolute file URL of an installed Playwright `index.mjs`, then run `node docs/audit/verify-accessibility.mjs`.

Lighthouse command:

```powershell
npm.cmd exec --yes --package=lighthouse -- lighthouse http://127.0.0.1:5173 --only-categories=accessibility --chrome-flags="--headless --no-sandbox" --output=json --output=html --output-path=docs/audit/lighthouse-a11y-fixed --quiet
```

These checks cover selected states and support the listed rubric items. A Lighthouse score of 100 does not certify every WCAG 2.2 AA criterion. A complete screen-reader and manual WCAG audit was not performed. The historical 96-point report is unavailable and has not been fabricated.
