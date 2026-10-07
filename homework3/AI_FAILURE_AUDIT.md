# AI Failure Audit - Homework 3

Project: UIT Tech Day - Resilient Event Landing Page  
Review date: October 7, 2026  
Stack: HTML, CSS, and vanilla JavaScript

## Scope and Evidence

This report records the actual development history, corrections, and final verification of the project. Evidence comes from Git history, source inspection, development-session Console screenshots, and manual tests reported as passing by the student.

The evidence supports one validation omission in an initial AI-generated prototype and one integration error while applying AI-provided instructions. The remaining security and resilience checks passed without exposing additional defects. Passing tests and prevented risks are not presented as defects that occurred.

Registration is simulated locally with a two-second delay. No registration data is sent to a server or persisted. Submission tests therefore verify client-side behavior, not a production registration API.

## Audit 1: Missing Validation After Trimming the Name

### Classification

Validation omission in the initial AI-generated form prototype. Validation after trimming was added in a later implementation stage.

### Defect Description

The initial version checked native form validity and then trimmed the name. It did not validate the trimmed result. A name containing only spaces could satisfy the raw input length requirement but become an empty string in the submission data. A one-character name followed by spaces could also become shorter than the required minimum after trimming.

This was a limitation of the intermediate implementation; it is not a claim that the final version accepted invalid names.

### Diagnostic Method

Git history inspection of commit `674bd0a` showed this order:

1. Call `form.reportValidity()`.
2. Read the inputs and call `.trim()`.
3. Enter the submitting state without checking the trimmed name length.

The relevant test cases were a whitespace-only name, a one-character name with trailing spaces, and a valid name with surrounding spaces.

### Refactored Solution

Commit `238b9e4` moved the preparation of trimmed input before the explicit validity check and added a length check for the trimmed name. Invalid names receive a native validation message through `setCustomValidity()`.

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

An input listener clears a previous custom validation message when the student edits the name, allowing a corrected value to be submitted.

### Verification

The student reported that the suggested validation tests passed in the final version: whitespace-only and short names are rejected, valid names are accepted, and leading or trailing whitespace is removed from the submitted name.

## Audit 2: Incorrect Integration of an Instrumentation Snippet

### Classification

Integration error while applying AI-provided testing instructions. This is not attributed to an independently generated syntax defect in the original complete form implementation.

### Defect Description

The duplicate-submission test required adding `console.count("registration-attempt")` to the existing `simulateRegistration()` function. During integration, an additional function declaration was pasted inside the submit handler instead.

The misplaced declaration changed the block structure, causing the browser to report:

```text
Uncaught SyntaxError: Unexpected token ')'
registration.js:98
```

The script could not execute, so this version could not validate submission behavior. The misplaced function also contained a call to its own name; that was a potential recursion problem in the malformed draft, not an observed runtime failure because parsing failed first.

### Diagnostic Method

The Console screenshot identified the syntax error and source line. Source inspection found both the original top-level function and an unintended second declaration inside the submit listener.

The Console result `undefined` from `requestSubmit()` was not treated as proof that the handler executed; that method does not return a success result.

### Refactored Solution

The unintended nested function was removed, the submit handler's `try/catch` structure was restored, and the temporary counter was placed at the beginning of the original function. A JavaScript syntax check then passed.

After functional verification, the counter was removed from the final source. The corrected form is included in commit `238b9e4`.

### Verification

The later Console screenshot showed no JavaScript errors. Its counter was already at 1 before two consecutive `requestSubmit()` calls and increased only to 2 afterward. This demonstrated one additional processing attempt for two submission requests while the form was submitting.

The form completed successfully and re-enabled its controls.

## Audit 3: Resilience and Output-Safety Review

### Classification

Verified risks; no additional defect was observed. This entry is not a third discovered AI-induced defect.

### Risks Reviewed

- Countdown drift if the implementation decrements a counter instead of recalculating from the current time.
- Negative countdown values or a timer continuing after expiration.
- Duplicate processing if the submitting state is set too late.
- HTML execution if user-controlled names are inserted with `innerHTML`.
- A form remaining locked after a failed submission.

### Diagnostic Method

Source inspection was combined with manual tests: switching tabs, using a past event timestamp, issuing consecutive submission requests, simulating failure, and submitting an HTML-like name.

### Existing Implementation and Verification

The countdown uses an explicit UTC timestamp and calculates the remaining duration from `eventTime - Date.now()` on every update. `Math.max(0, ...)` prevents negative durations, and `clearInterval()` stops the timer after expiration.

The form sets its submitting state before awaiting the simulated operation and ignores additional submissions in that state. Controls are re-enabled after either success or failure.

Submission messages use `textContent`. The student reported that the test input below was displayed as text without creating an image or opening an alert:

```text
<img src=x onerror=alert(1)>
```

No refactor is claimed for these checks because the reviewed implementation already contained these protections and the tests passed.

## Final Verification Results

The student confirmed that all suggested test cases passed. These are manual results; the report does not claim automated browser testing or a Lighthouse audit.

| Test | Result | Evidence source |
|---|---|---|
| 375px responsive layout without horizontal scrolling | PASS | Student confirmation and supplied viewport screenshot |
| Keyboard navigation with Tab and Enter | PASS | Student confirmation |
| Countdown after switching tabs | PASS | Student confirmation |
| Past event timestamp: zero values and expiration message | PASS | Student confirmation |
| Invalid timestamp: unavailable-time message | PASS | Student confirmation |
| Whitespace-only and short names rejected | PASS | Student confirmation |
| Invalid email rejected | PASS | Student confirmation |
| Successful simulated submission | PASS | Student confirmation and supplied form screenshot |
| Failed simulated submission permits retry | PASS | Student confirmation |
| Consecutive submission requests create one processing attempt | PASS | Console screenshot showing one counter increment |
| HTML-like input displayed as text | PASS | Student confirmation |
| JavaScript syntax checks | PASS | Syntax checks performed during this development session |

## Git Evidence

Seven separate Homework 3 implementation commits are present:

| Commit | Purpose |
|---|---|
| `a62e212` | Task decomposition and contracts |
| `af9cddd` | Semantic HTML structure |
| `e791a20` | Design tokens and global reset |
| `c7f7bd8` | Responsive layout |
| `a93d9dc` | UTC countdown |
| `674bd0a` | Registration state machine |
| `238b9e4` | Trimmed input validation and corrected form integration |

## Requirement Coverage and Limitations

The project has more than the required five atomic commits, and the reported final functional checks pass. However, the assignment specifically requests three discovered AI-induced defects. The available history does not yet substantiate three such defects: Audit 1 records an intermediate AI-prototype omission, Audit 2 records a snippet-integration error, and Audit 3 records passing risk checks.

This report preserves that distinction. Additional genuine findings, if discovered, should include the affected version, reproduction steps, diagnosis, fix, and verification rather than treating unobserved risks as failures.
