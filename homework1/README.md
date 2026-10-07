# HW1 — Personal Portfolio

A personal portfolio by **Phung Khanh Hung**, built with HTML, CSS, and JavaScript.

## Run locally

Install Python 3, then open a terminal in this folder:

```powershell
py -m http.server 5504 --bind 127.0.0.1
```

Open [http://127.0.0.1:5504/](http://127.0.0.1:5504/). Keep the terminal open. Press `Ctrl + C` to stop.

If port 5504 is busy, use 5505 in both the command and browser address. Use this server for testing: Live Server's injected reload script can be blocked by the CSP.

## Features

- Introduction, portrait, skills, and project cards.
- Responsive layout tested at 375px and 1280px.
- Light/dark theme saved with the localStorage key `theme`.
- Keyboard navigation, skip link, and visible focus.
- Contact form with native validation and a demo status message.
- Hash-based CSP and script integrity checks; no inline event handlers.

## Files

- `index.html`: page content.
- `style.css`: layout and theme colors.
- `theme.js`: theme switching.
- `contact.js`: demo form handling.
- `assets/`: portrait image.
- `project-rules.md` and `TASK_DECOMPOSITION.md`: rules and progress.
- `docs/audits/`: audit reports, screenshots, and results.

## Verification

| Milestone | Report |
| --- | --- |
| M1: Accessibility | [Accessibility audit](docs/audits/m1-accessibility.md) |
| M2: Keyboard | [Keyboard audit](docs/audits/m2-keyboard.md) |
| M3: Security | [Security audit](docs/audits/m3-security.md) |
| M4: Performance | [Performance audit](docs/audits/m4-performance.md) |

Recorded M4 results include Lighthouse Performance 100 under standard Mobile/Desktop configurations, Slow 4G LCP below 2 seconds, and CLS 0. Conditions and all category scores are recorded in the reports.

## Limits

- The contact form does not send or store messages.
- Study Planner and Drum Kit are planned projects.
- Narrator speech testing remains pending; automated checks do not prove full WCAG compliance.
- SEO scored 83; four-category Lighthouse 100 is not claimed.
- After changing either JavaScript file, update its SHA-256 hash in both the CSP and integrity attribute in `index.html`, then retest.
