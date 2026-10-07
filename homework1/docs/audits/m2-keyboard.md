# M2: Keyboard Navigation Check

Status: All checks listed below passed in four browser configurations.

## Test Details

- Date: 2026-10-06 (Asia/Saigon).
- Browser: Chrome 154.0.8037.98, headless.
- Page URL: http://127.0.0.1:5504/index.html.
- Server: Temporary Python HTTP server serving homework1 without an injected reload script.
- Viewports: 375 x 900 and 1280 x 900.
- Themes: Light and dark at both viewport sizes.
- Method: Playwright-generated Tab, Shift+Tab, Enter, Space, and text input events in Chrome. The form was completed using keyboard input, without clicking controls or calling DOM focus methods.
- Screen reader: Narrator spoken output was not tested; see the limitation below.

## Checks

The checks were run in each viewport/theme combination. Results describe the tested page, not every browser or assistive technology.

| Test | Expected Result | Result |
| --- | --- | --- |
| Press Tab from the start of the page. | The skip link receives focus and is visible. | Pass: first Tab reaches the visible skip link. |
| Press Enter on the skip link. | Focus moves to the main content. | Pass: activeElement becomes #main-content. |
| Press Tab through the page. | Links, buttons, and form fields receive focus in a sensible order. | Pass: all 13 interactive controls are reached in document order. |
| Press Shift+Tab. | Focus moves backward without getting stuck. | Pass: the reverse sequence matches the forward sequence in reverse order. |
| Press Enter on navigation links. | The matching section is reached. | Pass: all four links update the fragment and bring their matching section into view. |
| Press Enter and Space on the theme button. | The theme changes and the button state updates. | Pass: both keys toggle the theme; label, aria-pressed, localStorage, and reload state agree. |
| Navigate and complete the form. | All fields and the submit button are usable by keyboard. | Pass: Tab reaches each field and button; keyboard typing and Enter complete the form. |
| Submit an empty or invalid form. | Native validation identifies the invalid field. | Pass: empty form and short name focus the name field; invalid email focuses email; short message focuses the message field. |
| Submit valid form data. | The demo status appears without a page reload. | Pass: the demo status appears and performance.timeOrigin remains unchanged. |
| Check focus in both themes. | The focused control is easy to see. | Pass: all tested interactive controls show a solid 3px outline and are in the viewport while focused. |
| Try to leave every control with Tab or Shift+Tab. | There are no unintended keyboard traps. | Pass: forward/reverse traversal works, and focus can leave the first and last controls. |
| Modal focus handling | Audit dialogs only if present. | Not applicable: the page has no dialog or role=dialog element. |

## Focus Order

1. Skip link.
2. About, Skills, Projects, and Contact navigation links.
3. Theme button.
4. The three project-card links.
5. Name, email, and message fields.
6. Form submit button.

## Test Summary

| Viewport | Theme | Result |
| --- | --- | --- |
| 375 x 900 | Light | All listed checks passed. |
| 375 x 900 | Dark | All listed checks passed. |
| 1280 x 900 | Light | All listed checks passed. |
| 1280 x 900 | Dark | All listed checks passed. |

## Issues and Fixes

No keyboard defect or JavaScript runtime exception was found in these tests. No application-code change was made for this audit.

## Evidence and Limitations

- `m2-check-results.json` stores the focus sequences, navigation results, theme states, validation results, and browser information.
- `m2-375-light.png`, `m2-375-dark.png`, `m2-1280-light.png`, and `m2-1280-dark.png` show the page after keyboard-only valid form submission.
- Actual Narrator speech was not verified. The native application-control runtime failed to initialize with: "failed to write kernel assets: The system cannot find the path specified. (os error 3)". Browser accessibility snapshots are not treated as a Narrator session.

## Conclusion

M2 passes the keyboard-navigation checks listed in this report in both themes and at both tested viewport sizes. No unintended keyboard trap was found. Screen-reader speech and other browser/assistive-technology combinations remain outside the verified scope.
