# Task Decomposition – Exercise 3

## 1. Objective

Build the React component `PubgMatchTelemetry.jsx` to display PUBG squad information, manage data fetching through four states, cancel previous requests when switching squads, and support retrying after an error.

## 2. Scope

- Allow selection between The Expendables and Cerberus Esports.
- Manage four states: `IDLE`, `LOADING`, `SUCCESS`, and `ERROR`.
- Display the squad name and kill count after a successful request.
- Use `AbortController` to cancel requests when the selected squad changes or the component unmounts.
- Ignore `AbortError` to prevent intentional cancellation from showing an error alert.
- Display a skeleton while loading and an alert when an error occurs.
- Retry using the Reconnect Telemetry button and the `retryTick` counter.
- Record implementation in the two required commits.

**Limitation:** `pubgApi.js` currently uses mock data with a simulated two-second delay. It does not connect to the real KRAFTON API. Real API integration requires additional requirements and connection details.

## 3. Task Breakdown

| ID | Task | Implementation | Output |
| --- | --- | --- | --- |
| T1 | Analyze requirements | Identify states, squad switching, cancellation, and retry behavior | Functional requirements |
| T2 | Create the component | Create `PubgMatchTelemetry.jsx` and define props and state | Component accepting `squadId` |
| T3 | Add squad selection | Use `useState` and a `select` element in `App.jsx` | Selected squad passed to the component |
| T4 | Create the mock data service | Implement `fetchKraftonPubgTelemetry` with a `signal` parameter and a Promise | Squad name and kills returned after two seconds |
| T5 | Implement state transitions | Call the service inside `useEffect` and update state based on the result | Success and failure flows |
| T6 | Cancel previous requests | Create a controller for each effect and call `abort()` during cleanup | Previous request canceled on squad changes or unmounting |
| T7 | Handle errors and retries | Ignore `AbortError` and increment `retryTick` when Reconnect is clicked | Effect runs again to fetch data |
| T8 | Complete the interface | Add the skeleton, CSS, error alert, and accessibility attributes | Loading, error, and success interfaces |
| T9 | Perform manual checks | Check data loading, rapid squad switching, errors, and recovery | Results assessed against acceptance criteria |
| T10 | Record versions and documentation | Create two feature commits and write task decomposition documentation | Git history and `task_decomposition.md` |

Implementation sequence: T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9 → T10. The first commit records the core logic; the second records the interface improvements.

## 4. WBS (Work Breakdown Structure)

A WBS divides the project scope into deliverable groups and smaller work packages to support implementation, tracking, and acceptance.

```text
1.0 Exercise 3 – PUBG Match Telemetry
├── 1.1 Requirements and Design
│   ├── 1.1.1 Define the four states
│   └── 1.1.2 Define squad switching, cancellation, and retry behavior
├── 1.2 Mock Data Service
│   ├── 1.2.1 Define data for both squads
│   ├── 1.2.2 Simulate latency using a Promise
│   └── 1.2.3 Support AbortSignal and data errors
├── 1.3 Component Logic
│   ├── 1.3.1 Manage view and retryTick
│   ├── 1.3.2 Fetch data inside useEffect
│   ├── 1.3.3 Implement cleanup using AbortController
│   └── 1.3.4 Handle AbortError and retries
├── 1.4 User Interface
│   ├── 1.4.1 Squad selector
│   ├── 1.4.2 Squad name and kill count
│   ├── 1.4.3 Skeleton and loading animation
│   └── 1.4.4 Error alert and Reconnect button
├── 1.5 Verification
│   ├── 1.5.1 Load data for each squad
│   ├── 1.5.2 Switch squads while loading
│   ├── 1.5.3 Display errors
│   └── 1.5.4 Retry and recover successfully
└── 1.6 Delivery
    ├── 1.6.1 Commit core logic and AbortController
    ├── 1.6.2 Commit skeleton and retry alert
    └── 1.6.3 Document task decomposition
```

## 5. Acceptance Criteria

| Scenario | Expected Result |
| --- | --- |
| Component starts fetching data | Transition from `IDLE` to `LOADING` and display the skeleton |
| Select The Expendables | Display the squad name and 12 kills after approximately two seconds |
| Select Cerberus Esports | Display the squad name and 8 kills after approximately two seconds |
| Switch squads while loading | Cancel the previous request, fetch the newly selected squad, and show no cancellation alert |
| Unmount the component while loading | Cleanup cancels the pending request |
| Service returns an error | Transition to `ERROR` and display a message and the Reconnect button |
| Click Reconnect | Increment `retryTick`, transition to `LOADING`, and call the service again |
| Service becomes available again | Transition to `SUCCESS` and display the data |

The success interface, skeleton, error alert, and successful recovery after clicking Reconnect were observed during implementation. A temporary simulated error was used for verification and then removed from the final code. Rapid squad switching and component unmounting still require manual verification against the criteria above. This document does not claim that automated tests were run.

## 6. Deliverables

| File | Purpose |
| --- | --- |
| `src/App.jsx` | Squad selection and component integration |
| `src/components/PubgMatchTelemetry.jsx` | State management, request cancellation, retry logic, and rendering |
| `src/components/PubgMatchTelemetry.css` | Skeleton and error alert styling |
| `src/services/pubgApi.js` | Mock data service with cancellation support |
| `task_decomposition.md` | Task breakdown, WBS, and acceptance criteria |

## 7. Completed Git Milestones

| Commit | Description |
| --- | --- |
| `100296b` | `feat(ex3): implement PUBG VN 4-state telemetry & AbortController` |
| `0163ded` | `feat(ex3): add skeleton UI & retry alert` |

This document was added after the two feature commits above.
