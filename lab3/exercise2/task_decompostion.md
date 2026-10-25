# Exercise 2 Task Decomposition

*Interactive Scientist and Pioneer Directory*

## Objective and scope

Transform the static scientist dataset into an interactive React directory with name search, minimum IQ filtering, sorting, deletion, restoration, and an accessible result count. The work includes implementation, three atomic Git commits, verification, and submission evidence.

## WBS Work Breakdown Structure

The WBS divides the complete exercise into deliverables. Numbered child items define the work packages within each deliverable.

| WBS | Work package | Deliverable or acceptance criterion |
| --- | --- | --- |
| 1.0 | Project and data foundation | Running React project and normalized data |
| 1.1 | Prepare the React project | Install dependencies and confirm the local page loads. |
| 1.2 | Normalize scientist records | Create SMART_PEOPLE with stable id, name, age, and iq fields. |
| 2.0 | Interactive directory | A component with all required controls |
| 2.1 | Create state and rendering | Store people, query, minIq, and sortBy; render rows keyed by person.id. |
| 2.2 | Implement search and IQ filter | Match names without case sensitivity; use valueAsNumber with a NaN fallback. |
| 2.3 | Implement sorting | Use toSorted() for IQ descending or age ascending. |
| 2.4 | Implement delete and reset | Delete with filter(); restore initial data and default controls. |
| 2.5 | Add accessible controls and count | Link labels through useId(); announce visible counts with a polite status output. |
| 3.0 | Verification and submission | Reviewed implementation and evidence package |
| 3.1 | Verify behavior and reconciliation | Check combined filters, order, deletion, reset, stable elements, and focus. |
| 3.2 | Verify rendering performance | Record one character input in Profiler and check for one committed update. |
| 3.3 | Prepare submission evidence | Retain three atomic commits, screenshots, chat link, and GitHub link. |



## Implementation order and dependencies

### Phase 1 Foundation

Complete WBS 1.1 and 1.2 before creating the directory. Save the normalized dataset as the first commit.

### Phase 2 Search filtering and sorting

Complete WBS 2.1 to 2.3, connect the component to App, and verify the controls together. Compute visiblePeople directly during rendering; do not store it in state or synchronize it through useEffect.

### Phase 3 Deletion reset and accessibility

Complete WBS 2.4 and 2.5. Keep all existing controls visible. Reset restores six default records, an empty query, minimum IQ 160, and IQ descending order.

### Phase 4 Verification and evidence

Complete WBS 3.1 to 3.3 after implementation. Capture final evidence and add the repository link before submission.

## Required Git milestones

- Commit 1: feat(ex2): normalize smartPeople schema with stable IDs

- Commit 2: feat(ex2): add search, IQ filter & toSorted

- Commit 3: feat(ex2): add delete/reset & live status

## Verification checklist

- Search: einSTEIN returns Albert Einstein; clearing the query restores all records allowed by the IQ filter.

- IQ filter: an empty query and minimum IQ 200 return Goethe, Einstein, and Sidis. Clearing the numeric input does not cause NaN comparisons.

- Sorting: age ascending at minimum IQ 200 returns Sidis, Einstein, and Goethe; IQ descending returns Goethe, Einstein, and Sidis.

- Delete and reset: deleting Goethe from the full list leaves five records; reset restores six records and all default controls.

- Accessibility and reconciliation: verify label associations, the polite status counter, stable row identity, and focus on a surviving element during another row deletion. A DOM identity comparison alone is not a focus test.

- Profiler: record exactly one character input and confirm one committed update. Retain the 1 / 1 screenshot.

- Submission: include the source project, three-commit history, evidence document, chat link, and GitHub repository link.
