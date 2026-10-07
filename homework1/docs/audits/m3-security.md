# M3 Security Audit

**Status: PASS for the checks below.**

## Test setup

- Date: 2026-10-07 (Asia/Saigon).
- Browser: Chrome 154.0.8037.98, headless, controlled with Playwright.
- URL: http://127.0.0.1:5504/index.html (local HTTP server, no Live Server injection).
- Viewports: 375 x 900 and 1280 x 900, each in light and dark mode.
- Served HTML, CSS, JavaScript, and portrait bytes matched the local project files.

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| CSP is before stylesheets and scripts | PASS | Meta policy appears immediately after the charset declaration. |
| Restrictive script policy | PASS | Only the two SHA-256 hashes are allowed; no `unsafe-inline` or `unsafe-eval`. |
| Script integrity | PASS | Both script tags have integrity values matching their actual file bytes and CSP hashes. |
| Zero inline handlers and scripts | PASS | No `on*` attributes, inline script bodies, or `javascript:` links in the original document. |
| JavaScript source | PASS | Uses `addEventListener` and `textContent`; no `eval`, `new Function`, or `innerHTML` assignments found. |
| Stylesheet and portrait | PASS | Load successfully; no horizontal overflow at either tested width. |
| Theme switching | PASS | Theme, button state, and storage agree; selected theme survives reload. |
| Contact form | PASS | Empty fields and invalid email are rejected by native validation. Valid submission shows the demo message without navigation. |
| Normal application operation | PASS | No JavaScript runtime exceptions, application CSP errors, integrity errors, or failed application resource requests. |
| Injected inline script | PASS | Blocked by CSP (`script-src-elem`); execution flag remains false. |
| Injected inline event handler | PASS | Blocked by CSP (`script-src-attr`); execution flag remains false. |
| Unapproved same-origin script | PASS | A script without integrity is blocked, even though its URL is on the same origin. |
| Modified JavaScript response | PASS | Changing the theme script response causes an integrity error and prevents execution. Source files remain unchanged. |
| Probe cleanup | PASS | Reload restores the original two scripts and zero inline handlers. |

All normal-operation and CSP probe checks passed in all four viewport/theme combinations. The integrity tampering check passed in a separate browser context.

## Console notes

One normal-run console message was a 404 for `/favicon.ico`. The project has no favicon. This is separate from application JavaScript, CSP, and integrity failures; the console was therefore not completely empty in that run.

The deliberate CSP probes and integrity tampering produced expected blocking errors. These are evidence that the restrictions work, not normal-operation failures. Probes were created only in test browser sessions; no test payload was saved in the project source.

## Evidence

- `m3-check-results.json`: hashes, source checks, functional results, console messages, CSP violation events, and integrity test.
- `m3-375-light.png` and `m3-375-dark.png`: normal mobile rendering and valid form result.
- `m3-1280-light.png` and `m3-1280-dark.png`: normal desktop rendering and valid form result.

## Limits and maintenance

This verifies the current static portfolio and the listed checks, not every possible security threat. The policy is delivered through a meta tag; some CSP features require HTTP response headers. Dynamic evaluation blocking was not separately exercised from application code; the policy excludes `unsafe-eval` and the source contains no evaluation calls.

After editing either JavaScript file, recalculate its SHA-256 hash and update both its integrity attribute and the CSP before retesting. Byte changes, including line-ending changes, affect the hash. `form-action 'none'` fits this demo form; revisit the policy if a real backend is added.

Reference: [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP).

## Conclusion

M3 passes the tested requirements: restrictive hash-based CSP, zero inline handlers, working theme and form, and verified blocking of unapproved or modified scripts.
