# Homework 3 — Implementation Plan

## Project
A landing page for UIT Tech Day with an event countdown and registration form.

## Contracts
- Use plain HTML, CSS, and JavaScript.
- Store the event timestamp in UTC ISO 8601 format with a Z suffix.
- Calculate remaining time using Date.now().
- The form has four states: idle, submitting, success, and error.
- Ignore additional submissions while the form is submitting.
- Display user input using textContent.

## Tasks
1. HTML: event information, countdown area, and registration form with name and email fields.
2. CSS: responsive layout without horizontal scrolling at 375px.
3. Countdown: display days, hours, minutes, and seconds; stop when the event starts.
4. Form: validate inputs and implement submission states.
5. Security: prevent duplicate submissions and avoid interpreting user input as HTML.
6. Report: document three actual AI-generated defects, how they were detected, how they were fixed, and how the fixes were verified.

## Verification
- The countdown remains accurate after switching tabs and returning.
- A past event timestamp never produces negative values.
- Empty names and invalid email addresses prevent submission.
- Repeated clicks create only one submission while processing.
- Failed submissions allow the user to retry.
- Input containing HTML tags is displayed as text.
- The page works with keyboard navigation and at a 375px viewport.

## Workflow
Complete, verify, and commit each task separately.
When using AI, request one small task at a time.