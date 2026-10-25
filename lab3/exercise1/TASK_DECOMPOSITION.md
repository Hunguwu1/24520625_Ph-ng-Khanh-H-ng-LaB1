# Exercise 1 Task Decomposition

## Objective

Build a Semantic Engineer and Pro Gamer Profile Card using React 19 and Vite. The solution must use semantic HTML, reusable components, secure avatar media, CSS Modules, and a responsive layout at 375px.

## Implementation Tasks and Commits

### Task 1 Semantic React Components

- Set up the React application with Vite.
- Create `DeveloperCard` with ES6 default parameters for profile data, metrics, and skills.
- Use `article`, `header`, and `hgroup` to structure the profile header.
- Render metrics with `Object.entries()` and `dl`, `dt`, and `dd`, using keyed `Fragment` elements.
- Create the reusable `SkillBadge` component and render skills in a labeled `ul` with stable keys.
- Use an HTTPS avatar URL, meaningful alternative text, explicit image dimensions, and fallback initials when the image fails to load.
- Connect `aria-labelledby` to the profile heading and avoid all `<div>` elements inside `DeveloperCard.jsx`.

Commit: `feat(ex1): implement semantic DeveloperCard and SkillBadge`

### Task 2 Responsive CSS Module

- Replace the Vite starter styles with basic page styles.
- Create `DeveloperCard.module.css` and connect its classes to `DeveloperCard`.
- Define CSS custom properties for the card and badge colors.
- Style the profile header, avatar, fallback initials, metrics, and skill badges.
- Add a media query for screens up to 375px and verify that the page has no horizontal overflow at that width.
- Run the production build and inspect the accessibility properties in Chrome DevTools.

Commit: `style(ex1): add responsive 375px CSS module`

## Work Breakdown Structure WBS

The WBS organizes Exercise 1 into deliverables and smaller work packages. The two implementation commits above cover the component and styling work; submission documentation records the resulting evidence.

| WBS ID | Work package | Deliverable or completion criterion |
| --- | --- | --- |
| 1.0 | Exercise 1 profile card | Working React profile card and submission evidence |
| 1.1 | Project setup | Vite configuration, dependencies, and application entry point |
| 1.2 | Semantic components | Reusable profile card and skill badge |
| 1.2.1 | Profile header | Name and role grouped inside a semantic article header |
| 1.2.2 | Profile metrics | Definition list generated from metrics with keyed Fragments |
| 1.2.3 | Skills list | Labeled list of SkillBadge components with stable skill IDs |
| 1.2.4 | Secure avatar and fallback | HTTPS image, alt text, explicit dimensions, and fallback initials |
| 1.3 | Styling and responsiveness | Scoped card styles that fit a 375px viewport |
| 1.3.1 | Page styles | Starter styles replaced with base typography and layout |
| 1.3.2 | Card CSS Module | Card, header, avatar, metrics, and badge styles using custom properties |
| 1.3.3 | Mobile layout | Media query at 375px with no horizontal scrolling |
| 1.4 | Verification | Source audit, successful build, and DevTools inspection |
| 1.4.1 | Source audit | Zero `<div>` tags and zero insecure `http://` references in DeveloperCard.jsx |
| 1.4.2 | Build check | Successful `npm run build` |
| 1.4.3 | Browser inspection | Correct article and list names and roles; readable layout at 375px |
| 1.5 | Submission documentation | Task decomposition, evidence report, and submission links |
| 1.5.1 | Work plan | TASK_DECOMPOSITION.md with task descriptions and WBS |
| 1.5.2 | Evidence report | English Word document with screenshots, verification results, commit history, and chat link |
| 1.5.3 | Repository link | GitHub repository URL added to the evidence report when available |

## Acceptance Checklist

- `DeveloperCard` and `SkillBadge` are rendered successfully in the application.
- `DeveloperCard.jsx` contains no `<div>` tags or insecure `http://` media references.
- The avatar has explicit width and height attributes and displays initials when loading fails.
- Metrics use a definition list and keyed Fragments; skills use stable keys and a labeled list.
- Card styling uses a CSS Module and CSS custom properties.
- The page fits a 375px viewport without horizontal scrolling.
- Chrome DevTools reports the article name as `Tran Vinh Khiem` and its role as `article`.
- Chrome DevTools reports the skills list name as `Engineered Skills` and its role as `list`.
- `npm run build` completes successfully.
- Git history contains the two required implementation commits.
- Submission evidence includes the chat link and screenshots; the GitHub field is completed when the repository URL is available.
