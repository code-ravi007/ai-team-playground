# Design: "Clear completed" button

Existing UI: single page `index.html`, styles in `src/style.css` (tokens `--bg`, `--fg`, `--muted`, `--accent`, light and dark via `prefers-color-scheme`), logic in `src/app.js`, pure functions in `src/todos.js`. No component library. This design adds one button and reuses the global `button` rule. No new colours, tokens or components.

## User flow
1. Open page → list renders. Button is hidden if no task is ticked (including an empty list).
2. User ticks a task checkbox → `render()` runs → button appears under the list immediately.
3. User unticks the last ticked task → button hides immediately.
4. With at least one ticked task, user clicks (or Tab → Enter/Space) "Clear completed" → ticked tasks disappear, unticked tasks stay in order, the count text is unchanged, the button hides, focus moves to the "New task" input.
5. Reload → the list shows only the remaining tasks (saved via `save()` under `playground-todos`).
- Unhappy paths:
  - All tasks cleared: list is empty, count reads "0 tasks left", button hidden, reload shows the same.
  - `localStorage` unavailable: `save()` swallows the error, the list still clears for this visit, and there is no visible error.
  - No ticked tasks: the button is hidden, so nothing can be clicked. There is no disabled state.

## Screens and components
### Main page (`index.html`)
- Layout, top to bottom, inside `<main>`: `<h1>` (existing), add form (existing), `<ul id="list">` (existing), **`<button type="button" id="clear-completed" hidden>Clear completed</button>`** (new element, existing global `button` style), `<p id="count">` (existing).
- The button sits directly after `</ul>` and before `<p id="count">`, as the spec's task 3 says. It is left-aligned (default inline-block flow), at its natural width. It is not full width.
- No new component. No props.
- Behaviour:
  - `render()` sets `clearButton.hidden = !todos.some((t) => t.done)` on every render. Because every toggle, add and clear calls `render()`, no other visibility code is needed.
  - Click handler: `todos = clearCompleted(todos); save(todos); render(); input.focus();`. `clearCompleted` is imported from `./todos.js`, and `app.js` has no filter logic of its own.
  - Keyboard: native `<button>`, so Tab focuses it, and Enter and Space activate it. No extra key handling.
  - Hover and active: none beyond the browser defaults, as with the existing "Add" button. The button must not depend on hover.

## States
| View | Empty | Loading | Error | Success | Disabled | Long content |
|---|---|---|---|---|---|---|
| Clear completed button | Hidden (`hidden` attribute) when the list is empty | n/a. Everything is synchronous, with no loading state | n/a. `save()` failures are silent by existing design | After a click the tasks vanish and the button hides | n/a. It is hidden rather than disabled when nothing is completed | Label is fixed and short and does not change. Long task titles wrap inside `li`, as before |
| List after clearing | Empty `<ul>` takes no content. Count shows "0 tasks left". No extra empty-state message (out of scope) | n/a | n/a | Only unticked tasks remain, in original order | n/a | n/a |

- Visible state: the button shows the default `button` look (accent background, white text, 4px radius).
- Focus state: use the browser's default focus ring. Do not add `outline: none`. See the contrast note under Open design questions.

## Copy
| Key / location | Text |
|---|---|
| Button label | Clear completed |
| Count text (existing, unchanged) | "N tasks left" / "1 task left" / "0 tasks left" |
| Error / confirmation / empty messages | None (out of scope) |

The label is exactly "Clear completed" (sentence case, matching "Add" and "To-do list").

## Visual tokens
- Reuse the existing `button` rule: `padding: 0.5rem 1rem; font: inherit; background: var(--accent); color: #fff; border: 0; border-radius: 4px;`.
- Spacing: no CSS change is expected. The `ul` default bottom margin (1em) separates the list from the button, and the `p#count` default top margin (1em) separates the button from the count. If the Developer sees the button touching the list (for example when the list is empty, where margins collapse), add at most `#clear-completed { margin-top: 0.5rem; }`. Do not add other rules.
- Do not add a `display` rule to `button` or `#clear-completed`. It would override `hidden`. The current stylesheet has none, so `hidden` works as it is.
- Colours: none new. Both themes are handled by the existing `--accent` tokens.

## Responsive behaviour
- All widths (including 360 px and 320 px): the button is inline-block at its natural width of roughly 9–10 rem, which is well under 320 px minus the 1rem side padding of `main`. Nothing scrolls horizontally. No breakpoint changes.
- At 200% zoom the button stays in the normal flow and the label does not clip.

## Accessibility
- Semantics: native `<button type="button">` with visible text as its accessible name. It is not in the form, so it never submits it.
- Keyboard order, which follows DOM and visual order: "New task" input → "Add" → task checkboxes (top to bottom) → "Clear completed" (only when visible) → end of page. Because the button is `hidden`, it is removed from the tab order and the accessibility tree when nothing is completed.
- Focus management: the button hides itself on click, and a focused element that becomes hidden drops focus to `<body>`, which breaks keyboard flow. So after clearing, move focus to the "New task" input (`input.focus()`). This is the natural next action, and it is the only programmatic focus move. It only happens in response to the user's click and never on checkbox toggles. Do not move focus when ticking or unticking.
- Live region: the count `<p>` has no live region today and the count does not change on clear. The spec adds no announcement. See the open questions.
- Contrast: light mode white on `#3a5bd9` is about 5.6:1, which passes. See the dark-mode note under Open design questions.
- Target size: the button is about 40 px high (0.5rem×2 padding + 24 px line height) and about 140 px wide, which is above the 24 px minimum and consistent with the existing "Add" button. It is slightly under the 44 px aim. Do not make it a one-off change. It is left matching "Add".
- Motion: none added. No transitions, so nothing to disable for `prefers-reduced-motion`.
- Colour is not the only cue. The button has a text label.

## Developer notes
- Use the `hidden` attribute and a property assignment (`button.hidden = ...`), not `style.display` and not creating or removing the element.
- The initial HTML must include `hidden`, so there is no flash of the button before the script runs. `render()` runs at the end of `app.js` and sets the real value.
- Place the `getElementById("clear-completed")` lookup with the other element lookups, before `render()` is defined and called. `render()` references it on first run.
- The click handler must be registered once at module level, not inside `render()`, or it will stack up listeners.
- After clearing, do not renumber ids. `addTodo` uses max id + 1, which is safe, and if the list is empty it starts again at 1.
- `input.focus()` after clear is the one addition beyond the spec's task 4 wiring. It is needed for keyboard users, and it is a single line.
- Tests are only for `clearCompleted` in `test/todos.test.js`. No DOM tests.

## Open design questions
- Dark mode contrast of the existing button: white text on `--accent` `#8aa2ff` is about 2.4:1, below 4.5:1. This is an existing problem affecting "Add" too, and the spec says not to add colours, so it is not fixed here. Suggested follow-up: use dark text (for example `var(--bg)`) on the button in dark mode.
- Screen reader feedback: when tasks are cleared there is no spoken confirmation. Should a polite status message (for example "Completed tasks cleared") be added? Not designed because it is out of the spec's scope.
- Default focus ring: there is no custom `:focus-visible` style. The browser default is assumed to meet 3:1 on both themes. Please verify on `#111113` and `#fafafa` during manual checks.
