# M1: Accessibility Audit

Status: Verified source, browser, and automated checks pass. Lighthouse Accessibility is 100/100 in all four configurations. Narrator spoken-output verification remains pending.

## Test Details

- Date: 2026-10-06 (Asia/Saigon).
- Files reviewed: `index.html` and `style.css`.
- Method: Source review, axe-core 4.14.0, Lighthouse 13.5.0 Accessibility, browser accessibility snapshots, keyboard interaction, contrast calculations, and screenshot review.
- Browser and version: Headless Chrome 154.0.8037.98, controlled with Playwright.
- Page URL: http://127.0.0.1:5504/index.html.
- Server: A temporary Python HTTP server serving the existing homework1 folder, without Live Server's injected reload script.
- Viewports: 375 x 900 and 1280 x 900.
- Themes: Light and dark, tested at both viewport sizes.

## Checks

| Check | Expected Result | Result |
| --- | --- | --- |
| Page language | The HTML language matches the content: `lang="vi"`. | Pass (source): Vietnamese content and lang="vi". |
| Landmarks | The page exposes the expected landmarks. | Pass: the browser accessibility snapshot contains one banner, one named navigation, one main, and one contentinfo. Project-card headers/footers do not create extra top-level landmarks. |
| Headings | There is one h1 and no skipped heading levels. | Pass: one h1, four h2 headings, and six h3 headings in a logical order. |
| Image alternative text | Informative images have appropriate alt text. | Pass based on owner confirmation: the user states this is their photo, so the existing alt text identifying Phung Khanh Hung is retained. |
| Image file | The referenced image loads and decodes correctly. | Pass: assets/images.jpg is a valid JPEG, 28,189 bytes, and loads in all four browser runs. |
| Image dimensions | Declared dimensions match the image aspect ratio. | Pass after correction: HTML now declares width="399" and height="501", matching the actual image. |
| Form labels | Every field has a visible, correctly associated label. | Pass: all three fields expose their labels; clicking each label focuses the matching field. |
| Buttons and links | Their names explain their purpose. | Pass: descriptive names appear in the accessibility snapshot. Theme text, aria-pressed, saved state, and reload behavior agree after keyboard activation. |
| Skip link | Keyboard activation moves focus to main content. | Pass: Tab reveals the skip link; Enter focuses #main-content in all four runs. |
| Focus | Keyboard focus is visible in both themes. | Pass for tested controls: links, buttons, and fields have a solid 3px outline; screenshots confirm skip-link focus visibility. |
| Light theme contrast | Normal text contrast is at least 4.5:1. | Pass for the listed CSS color pairs; lowest calculated ratio is 6.90:1. |
| Dark theme contrast | Normal text contrast is at least 4.5:1. | Pass for the listed CSS color pairs; lowest calculated ratio is 8.77:1. |
| Narrow-screen layout | Content fits the viewport. | Pass at 375px and 1280px: no horizontal overflow was measured. |
| Form feedback | Invalid input is identified and valid input receives clear feedback. | Pass: empty submission focuses the name field; valid data displays the demo message in a role=status region without navigation. Screen-reader announcement was not tested with assistive software. |
| Lighthouse Accessibility | Run the automated accessibility audit and save actual scores. | Pass: 100/100, with no failed scored accessibility audits or run warnings in all four configurations. |
| Narrator speech | Verify the actual spoken names, roles, state changes, and form status. | Not tested: native application-control runtime could not initialize. Accessibility snapshots are supporting evidence only, not proof of spoken output. |

## Issues and Fixes

- Resolved since the previous review: HTML now references a real image, `assets/images.jpg`; Skills and Projects contain content.
- Owner clarification: The user confirmed that the displayed image is their photo. The earlier alt-text failure is withdrawn; the original alt text is retained based on that clarification.
- Fix made: Changed the declared image dimensions from 400 x 400 to 399 x 501 to match the file.
- Retest: All four viewport/theme combinations still pass the defined automated and browser checks. Evidence files were regenerated after the dimension correction.
- Additional console finding: One initial favicon.ico request returned 404. No JavaScript runtime exception was detected. The missing favicon does not explain an accessibility failure and should be handled separately from the image alt issue.

## Evidence

Source and browser checks found one h1, four h2 elements, six h3 elements, zero div elements, unique IDs, and three correctly associated form labels.

### Automated Results

The axe-core scan used WCAG 2.0, 2.1, and 2.2 Level A/AA tags. Each run had 26 passed rules, zero reported violations, and zero incomplete rule results. These totals are rule results, not a Lighthouse score or proof that all WCAG criteria pass.

| Viewport | Theme | Passed Rules | Violations | Incomplete |
| --- | --- | --- | --- | --- |
| 375 x 900 | Light | 26 | 0 | 0 |
| 375 x 900 | Dark | 26 | 0 | 0 |
| 1280 x 900 | Light | 26 | 0 | 0 |
| 1280 x 900 | Dark | 26 | 0 | 0 |

### Lighthouse Results

Lighthouse 13.5.0 was run programmatically against the same local files using Chrome. Only the Accessibility category was requested; these are not Performance, Best Practices, or SEO scores.

| Viewport | Theme | Accessibility | Failed Scored Audits | Run Warnings |
| --- | --- | --- | --- | --- |
| 375 x 900 | Light | 100/100 | 0 | 0 |
| 375 x 900 | Dark | 100/100 | 0 | 0 |
| 1280 x 900 | Light | 100/100 | 0 | 0 |
| 1280 x 900 | Dark | 100/100 | 0 | 0 |

The selected theme was saved before each audit and storage reset was disabled to preserve it. A fresh temporary Chrome profile was used for each run. Lighthouse's manual-check items are not automatically verified by a score of 100.

### Saved Evidence

- `m1-check-results.json`: browser version, axe results, accessibility snapshots, headings, image details, focus checks, form checks, theme checks, and console findings.
- `m1-375-light.png`, `m1-375-dark.png`, `m1-1280-light.png`, and `m1-1280-dark.png`: full-page screenshots.
- `m1-focus-375-light.png`, `m1-focus-375-dark.png`, `m1-focus-1280-light.png`, and `m1-focus-1280-dark.png`: focused skip-link screenshots.
- `m1-lighthouse-summary.json`: scores, configuration, manual-check items, and warnings for the four Lighthouse runs.
- `m1-lighthouse-375-light.html/.json`, `m1-lighthouse-375-dark.html/.json`, `m1-lighthouse-1280-light.html/.json`, and `m1-lighthouse-1280-dark.html/.json`: complete Lighthouse reports in HTML and JSON formats.
- `m2-check-results.json`: additional keyboard-only navigation, theme activation, and form-validation evidence collected for M2.

### Contrast Results

Contrast ratios were calculated from the declared CSS colors using `(Llighter + 0.05) / (Ldarker + 0.05)`. Displayed ratios are rounded to two decimal places; pass/fail checks use the unrounded values.

| Theme | Use | Foreground | Background | Ratio |
| --- | --- | --- | --- | --- |
| Light | Body text | #172033 | #ffffff | 16.27:1 |
| Light | Field/card text | #172033 | #f1f5f9 | 14.85:1 |
| Light | Links on page | #075985 | #ffffff | 7.56:1 |
| Light | Button text | #ffffff | #075985 | 7.56:1 |
| Light | Accent on surface | #075985 | #f1f5f9 | 6.90:1 |
| Dark | Body text | #f8fafc | #0f172a | 17.06:1 |
| Dark | Field/card text | #f8fafc | #1e293b | 13.98:1 |
| Dark | Links on page | #7dd3fc | #0f172a | 10.71:1 |
| Dark | Button text | #0f172a | #7dd3fc | 10.71:1 |
| Dark | Accent on surface | #7dd3fc | #1e293b | 8.77:1 |

Reference: [W3C WCAG 2.2 - Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

### Screen-Reader Limitation

A native application-control initialization was attempted so that Narrator could be tested. It failed with: "failed to write kernel assets: The system cannot find the path specified. (os error 3)". No Narrator speech was heard or captured, and no Narrator result is marked Pass.

Browser checks were performed in Chrome only. The listed contrast measurements do not cover every possible rendered state or browser-controlled validation message. A real Narrator session should verify heading/image descriptions, control names and state changes, required-field feedback, and the role=status announcement before that test is marked complete.

## Conclusion

The verified source/browser checks pass, and Lighthouse Accessibility scores 100/100 in all four configurations. Image dimensions are correct and the owner confirmation resolves the earlier alternative-text concern. Narrator spoken-output testing remains pending because the native-control runtime could not start. This review does not establish full WCAG 2.2 AA compliance.
