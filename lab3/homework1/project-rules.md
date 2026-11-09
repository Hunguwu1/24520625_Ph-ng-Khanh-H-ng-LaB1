# Drum Kit Project Rules

- Use React function components, hooks and TypeScript. Do not use class components, ReactDOM.render, defaultProps, keyCode or alert().
- Update state immutably using functional updates when the next value depends on the previous value.
- Use physical KeyboardEvent.code; ignore repeated shortcuts, modifier combinations, text entry and IME composition. Native pad activation must not repeat while Enter or Space is held.
- Use semantic landmarks and native buttons. Associate every input and meter explicitly through label htmlFor and React useId(). Keep visible keyboard focus and allow Tab to leave every region.
- Require no horizontal overflow at 375 CSS pixels; also check 320px, 390px and reflow layouts.
- Target Lighthouse Accessibility 100 and no applicable axe violations. Record manual checks separately; automated checks do not establish complete WCAG conformance.
- Never insert untrusted HTML or execute user strings. Keep audio URLs in application-owned data; render user text through React.
- Clean up listeners, timers and audio resources. Handle failed sample loading without retaining rejected cache entries.
- Verify changes using build, lint and relevant browser checks. For forensic bugs, preserve a real baseline revision, reproduction, observed failure and passing regression after correction.
- Do not invent AI prompts, authorship, historical failures or test results. Distinguish verified behavior from inferred causes.
- Commit one coherent change at a time. Preserve existing history; do not fabricate earlier development milestones. Keep secrets, dependencies and temporary baseline copies out of Git.
