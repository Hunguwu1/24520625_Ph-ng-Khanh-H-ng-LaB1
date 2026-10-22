# AI Audit — Flash Sale E-Commerce Engine

## Scope and Evidence

AI was used to break down the assignment, explain code, suggest implementation steps, and help investigate errors. This report examines **three specific incidents** encountered during development, their effects, the fixes, and the lessons learned. Logs and commits show that an issue or change occurred; they **do not, by themselves, prove** that AI wrote the code responsible for it. If the grading criteria require proof that AI authored each mistake, the relevant conversation excerpts or original drafts should be attached.

## 1. Transaction guidance did not account for the full call chain

**Observed behavior.** During reservation testing, `reservation validates stock, version and rollback` failed with `Error: cannot start a transaction within a transaction` in `reserveInventory()`.

**Cause.** During integration, the code contained two transaction starts. In addition, `expireReservations()` opens its own transaction, so calling it after `BEGIN IMMEDIATE` on the same SQLite connection would also create a nested transaction. Instructions that add an isolated code snippet without identifying the code it replaces can lead to this kind of error. The log alone does not establish that AI wrote the duplicated statement.

**Fix.** Call `expireReservations()` before opening the reservation transaction. Each reservation operation now has one `BEGIN IMMEDIATE`; the inventory update and reservation insert happen in that transaction, with `ROLLBACK` on failure. The current implementation is in `server/reservations.ts` and `server/expiration.ts`. Commit `116653a` records changes related to integrating expiration handling.

**Verification.** `server/reservations.test.ts` covers successful reservations, version conflicts, insufficient stock, and rollback when the reservation insert is forced to fail. The current test passes. This verifies the repaired version; it does not rerun the historical faulty version.

**Lesson.** When integrating AI suggestions, inspect transaction ownership throughout the call chain and state exactly which existing code a new snippet replaces.

## 2. Treating a passing test file as proof without checking its assertions

**Observed behavior.** An early test result included `✔ server\expiration.test.ts`, but inspection during troubleshooting found that the file did not yet contain assertions for expiration behavior. Therefore, the passing result did not prove that expired reservations released inventory correctly. The earlier file state is not preserved in Git history: `server/expiration.test.ts` was first committed in `116653a`. No original AI draft is available to establish who created the earlier file.

**Fix.** Add the test `expiration respects deadline, releases once and rolls back`. It checks that a reservation remains `ACTIVE` before its deadline; becomes `EXPIRED` and releases stock at the deadline; does not release stock twice on a repeated scan; and rolls back both reservation status and inventory when an inventory update fails.

**Verification.** The corresponding assertions are present in `server/expiration.test.ts`, and the test passes. Commit `116653a` contains the test.

**Lesson.** Read the test name, steps, and assertions before using a “pass” result as evidence. The number of passing test files is not the number of business scenarios verified.

## 3. A five-minute demo sale was too short for the assignment workflow

**Observed behavior.** The previous configuration set `endsAt = startsAt + 5 * 60 * 1000`. The backend ran beyond that deadline while the assignment was being studied, tested, and committed. The interface showed `Flash Sale đã kết thúc` (“Flash Sale has ended”), the countdown displayed `00:00.000`, and the buy button was disabled even though eight units remained. API data showed that `serverNow` had passed `endsAt`.

**Cause.** The suggested demo duration did not account for the fact that the sale starts when the **backend starts**, rather than when a user opens the page. Disabling purchases after the deadline was correct business behavior; the issue was the demo configuration and the explanation of the application lifecycle.

**Fix.** Commit `f29deaa` increased the default duration from five to 30 minutes, added configuration through `FLASH_SALE_DURATION_MS`, and validated the supplied value. Reloading the page does not extend the sale. Restarting the backend creates fresh demo data because SQLite runs in memory.

**Verification.** The diff in commit `f29deaa` shows the duration and validation changes. The current tests and build pass. The automated tests do not separately assert the 30-minute default; that configuration is supported by the code and by an API check performed after the fix.

**Lesson.** Before applying an AI-suggested value, check when the timer starts, how long the data lives, and how much time the real demo workflow takes. Resetting the frontend timer on each page load would make the shared backend deadline incorrect.

## Rechecking the Current Version

From `lab2/homework3`, run:

```powershell
npm.cmd test
npm.cmd run build
git show 116653a -- lab2/homework3/server/reservations.ts lab2/homework3/server/expiration.test.ts
git show f29deaa -- lab2/homework3/server/store.ts
```

On October 22, 2026, `npm.cmd test` reported **4 tests passed, 0 failed**, and `npm.cmd run build` completed successfully. These results establish the current state of the project; they do not replace the AI conversation record from the time each issue occurred.
