# AI Failure Audit - Homework 3

Project: UIT Tech Day - Resilient Event Landing Page  
Review date: October 7, 2026  
Stack: HTML, CSS, and vanilla JavaScript

## Scope and Evidence

This report documents three defects or contract omissions found while reviewing AI-generated intermediate versions of the project. Each finding includes a defect description, diagnostic method, refactored solution, and verification evidence.

Evidence includes the original code in Git history, the final source, manual browser tests reported by the student, an isolated execution check of the final timestamp parser, and contrast calculations using the actual CSS color values. Functional browser results are not presented as an automated browser audit.

Registration is simulated locally. No registration data is sent to a server or persisted, so the submission tests cover client-side behavior rather than a production registration API.

## Finding 1: Missing Validation After Trimming the Name

### Defect Description

The initial AI-generated form prototype called native validation before trimming the name, then submitted the trimmed value without checking its length again. A whitespace-only name could satisfy the raw input length requirement but become an empty submitted name. A one-character name with trailing spaces could also become shorter than the required minimum after trimming.

This was a defect in an intermediate implementation, corrected during the later input-validation stage.

Affected version: commit `674bd0a`, `registration.js`.

### Diagnostic Method

Git history inspection compared the initial form implementation with the validation fix. The original sequence was:

1. Call `form.reportValidity()`.
2. Create the submission data using `.trim()`.
3. Enter the submitting state without validating the trimmed name length.

The relevant manual tests used a whitespace-only name, a one-character name followed by spaces, and a valid name with surrounding spaces.

### Refactored Solution

The revised handler prepares the trimmed data first, clears any previous custom validation error, and checks the normalized name length before entering the submitting state.

```js
const data = {
  fullName: fullNameInput.value.trim(),
  email: emailInput.value.trim(),
};

fullNameInput.setCustomValidity("");

if (data.fullName.length < 2) {
  fullNameInput.setCustomValidity(
    "Please enter a name with at least 2 characters."
  );
} else if (data.fullName.length > 80) {
  fullNameInput.setCustomValidity(
    "Please enter a name with no more than 80 characters."
  );
}
```

An input listener clears the custom error when the user edits the name. The handler then calls `reportValidity()` and returns without submitting if validation fails.

Fix commit: `238b9e4` - `fix(form): validate trimmed registration input`.

### Verification

The student reported that the final validation tests passed:

- Whitespace-only names are rejected.
- Names shorter than two characters after trimming are rejected.
- Valid names are accepted, and surrounding whitespace is removed from the submitted value.
- A corrected name can be submitted after an earlier validation error.

## Finding 2: Missing Enforcement of the UTC Timestamp Contract

### Defect Description

The initial AI-generated countdown parsed the HTML timestamp directly:

```js
const eventTime = Date.parse(eventTimeElement.dateTime);
```

Its only invalid-input check was `Number.isNaN(eventTime)`. However, a date-time string without a timezone suffix can still be parsed successfully. JavaScript interprets that string in the device's local timezone, contrary to this project's contract requiring UTC ISO 8601 timestamps with a `Z` suffix.

For example, on a device using Vietnam time, these inputs represent instants seven hours apart:

```text
2026-12-01T02:00:00Z
2026-12-01T02:00:00
```

The original configured timestamp included `Z` and was correct. The defect was failure to reject an ambiguous configuration input, not an observed seven-hour error with the original valid configuration.

Affected version: commit `a93d9dc`, `countdown.js`.

### Diagnostic Method

Source inspection found that the code relied on parseability rather than checking the UTC contract. A negative-input test removed `Z` from the timestamp while leaving the countdown logic unchanged. The original parser still accepted the timestamp instead of taking the unavailable-time path.

A timezone comparison executed with `Asia/Ho_Chi_Minh` produced:

```text
UTC input:           2026-12-01T02:00:00.000Z
Input without zone:  2026-11-30T19:00:00.000Z
Difference:          -7 hours
```

This behavior is documented in [MDN: Date.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse).

### Refactored Solution

The countdown now checks the project's explicit UTC format before calling `Date.parse()`. A nonmatching input produces `NaN`, activating the existing error message and preventing timer startup.

```js
const eventTimeElement = document.querySelector("#event-time");
const eventTimestamp = eventTimeElement.dateTime;

const utcPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

const eventTime = utcPattern.test(eventTimestamp)
  ? Date.parse(eventTimestamp)
  : NaN;
```

The valid timestamp in `index.html` was restored to `2026-12-01T02:00:00Z`.

Fix commit: `12c92a6` - `fix(countdown): require explicit UTC timestamps`.

### Verification

An isolated execution check used the timestamp parsing code from the final `countdown.js` and confirmed:

| Input | Result |
|---|---|
| `2026-12-01T02:00:00Z` | Accepted |
| `2026-12-01T02:00:00.000Z` | Accepted |
| `2026-12-01T02:00:00` | Rejected |
| `invalid` | Rejected |

The existing invalid-input branch displays `The event time is unavailable.` when parsing fails.

## Finding 3: Insufficient Contrast of Text Input Boundaries

### Defect Description

The initial AI-generated CSS used `--color-border: #cbd5e1` for text input borders. Both the input background and the surrounding section background were `#ffffff`.

When an enabled input is empty and unfocused, its border is the visual indicator of the editable area. The contrast of the original border against white was approximately 1.485:1, below the 3:1 minimum for necessary non-text indicators of user interface controls under WCAG 2.2 AA, Success Criterion 1.4.11.

This accessibility issue was not revealed by functional submission tests or by simply checking whether the page looked readable.

Affected version: commit `c7f7bd8`, `style.css`.

### Diagnostic Method

CSS inspection identified the input border, input background, and section background. DevTools computed-style inspection can reproduce the original values:

```text
Border:      rgb(203, 213, 225) = #cbd5e1
Background:  rgb(255, 255, 255) = #ffffff
```

The contrast ratio was calculated from their relative luminance:

```text
contrast = (lighter luminance + 0.05) / (darker luminance + 0.05)
```

The result was compared against [W3C: Understanding Non-text Contrast, SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). The assessment concerns enabled input boundaries; it does not require decorative section borders to meet the same threshold.

### Refactored Solution

A separate token was introduced for form control boundaries:

```css
:root {
  --color-control-border: #64748b;
}
```

The input rule now uses this token:

```css
input {
  border: 1px solid var(--color-control-border);
}
```

Decorative section borders retain the original token. The existing keyboard focus outline remains in place.

Fix commit: `f8b91a6` - `fix(a11y): improve input boundary contrast`.

### Verification

The final source was inspected to confirm the new token and its use in the input rule. Contrast was recalculated from the actual stylesheet values:

| Input boundary | Adjacent background | Contrast | Result |
|---|---|---|---|
| Original `#cbd5e1` | `#ffffff` | Approximately 1.485:1 | FAIL |
| Updated `#64748b` | `#ffffff` | Approximately 4.759:1 | PASS |

The updated boundary exceeds the 3:1 threshold. This confirms the specific contrast correction, not a complete WCAG conformance audit of every aspect of the page.

## Additional Functional Verification

The student confirmed that the previously suggested manual tests passed:

| Test | Result | Evidence |
|---|---|---|
| 375px viewport without horizontal scrolling | PASS | Student confirmation and supplied viewport screenshot |
| Keyboard navigation using Tab and Enter | PASS | Student confirmation |
| Countdown after switching tabs | PASS | Student confirmation |
| Past timestamp produces zero values and expiration message | PASS | Student confirmation |
| Invalid email is rejected | PASS | Student confirmation |
| Successful simulated submission | PASS | Student confirmation and supplied form screenshot |
| Failed simulated submission permits retry | PASS | Student confirmation |
| Consecutive submission requests create one processing attempt | PASS | Console screenshot showing one additional counter increment |
| HTML-like name is displayed as text without execution | PASS | Student confirmation |

The temporary submission counter was removed after testing. The final form uses `textContent`, sets the submitting state before awaiting the simulated operation, and rejects further submissions while processing. The countdown recalculates from `Date.now()` and clears its timer after expiration.

No countdown drift or XSS vulnerability is claimed as a discovered defect because those checks passed. The earlier snippet-pasting syntax error is also excluded from the three findings because it was an integration error rather than a defect in the original complete AI-generated implementation.

## Requirement Coverage

The report contains three findings from AI-generated code review. Each includes the defect description, diagnostic method, refactored solution, verification evidence, and an identifiable fix commit.

| Finding | Original version | Fix commit |
|---|---|---|
| Missing validation after trimming the name | `674bd0a` | `238b9e4` |
| Missing enforcement of the UTC timestamp contract | `a93d9dc` | `12c92a6` |
| Insufficient contrast of input boundaries | `c7f7bd8` | `f8b91a6` |

The Git history also contains separate commits for task decomposition, semantic HTML, design tokens, responsive layout, countdown behavior, and form states, exceeding the minimum five atomic commits.
