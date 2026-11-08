# HW3 Lab 3 — Code Quality, Modern Standards and Security

Recreated and verified on November 8, 2026. This replaces a missing uncommitted review with a fresh record.

## Changes

- Replaced HTML-string insertion in the historical Lab 2 `src/main.ts` entry with createElement, textContent, append and replaceChildren. Existing element IDs and control defaults are retained.
- Replaced the unused starter counter's HTML assignment with textContent.
- Enabled frontend TypeScript strict checking; the server already enables strict checking.
- Added [an HTML-escaping regression test](../../tests/security.test.tsx) to the normal test command. Hostile image/script markup in drop titles and virtual-list text must be escaped, with no active image or script element emitted.

## Source review

The application uses function components, hooks and createRoot. Scanned `src`, `server`, `public` and `index.html` for the following patterns; none were found:

- Class components, ReactDOM.render, defaultProps, keyCode, alert calls.
- innerHTML, outerHTML, insertAdjacentHTML, document.write, dangerouslySetInnerHTML.
- eval, new Function, javascript URLs.

The current React interface renders text through JSX and has no user-controlled navigation URL attributes. The retained DOM entry outputs data with textContent. The inherited backend validates request bodies, uses bound SQL parameters, and returns JSON with generic public internal-error messages.

## Verification evidence

- [Test output](test-results.txt): five tests passed, zero failures, including the React HTML-escaping regression and four inherited backend tests.
- [Build output](build-results.txt): strict frontend checking, server checking, and production build passed.

Reproduce with `npm.cmd test` and `npm.cmd run build`. The HTML-escaping check is a server-rendered markup assertion, not a browser penetration test.

This review supports the specific rubric checks, not an absolute guarantee that no XSS vulnerability exists. Third-party dependency security and full penetration testing were not assessed. Mock claim responses and demo identity are not production authentication or shared inventory.
