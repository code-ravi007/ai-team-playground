# Spec: Add a "Clear completed" button to the to-do list

When at least one task is ticked off, a "Clear completed" button appears under the list. Clicking it removes every completed task and saves the result, so the cleared list is still there after a reload. The removal logic is a new pure function in `src/todos.js` with a unit test, which follows the existing split between logic and page code.

## User stories
- As a user with some finished tasks, I can click "Clear completed" so that my list only shows what is still to do.
- As a user, I can reload the page after clearing so that the removed tasks stay gone.
- As a user with no finished tasks, I do not see the button so that the page is not cluttered with a control that does nothing.

## Acceptance criteria
- [ ] `src/todos.js` exports a pure function `clearCompleted(todos)` that returns a new array containing only the todos where `done` is false, in their original order and with their ids and titles unchanged.
- [ ] `clearCompleted` does not mutate the array passed in or its items. If nothing is completed it returns an array with the same contents. For `[]` it returns `[]`.
- [ ] `test/todos.test.js` has tests for `clearCompleted`: (a) a mix of done and not-done todos leaves only the not-done ones in order, (b) all done returns `[]`, (c) none done leaves the list unchanged, (d) the input array is not mutated.
- [ ] `node --test` (and `npm test`) exits 0 with the existing three tests and the new ones all passing.
- [ ] `index.html` has a `<button type="button" id="clear-completed">Clear completed</button>` placed after the `<ul id="list">` (under the list). The label text is exactly "Clear completed".
- [ ] On first load with no saved todos, the button is not visible (it has the `hidden` attribute and takes no space).
- [ ] With todos present but none ticked, the button is not visible. Ticking one task makes it visible immediately, without a reload.
- [ ] Unticking the last completed task hides the button again immediately.
- [ ] Clicking the button removes every completed task from the list on screen, leaves uncompleted tasks in place, and updates the "N tasks left" count text (the count does not change, because only completed tasks are removed).
- [ ] After clicking the button, the button is hidden, since nothing is completed any more.
- [ ] After clicking the button and reloading the page, the list shows only the tasks that were not completed. The change is written to `localStorage` under the existing `playground-todos` key through the existing `save()` function.
- [ ] If all tasks are cleared, the list is empty, the count reads "0 tasks left", and reloading shows the same empty state with no errors in the console.
- [ ] Adding a new task after clearing still works. New ids are computed by the existing `addTodo` logic and there are no duplicate ids.
- [ ] The button works with the keyboard: it can be reached with Tab and activated with Enter or Space.
- [ ] The button reuses the existing global `button` styles in `src/style.css` so it looks consistent in light and dark mode. At 360 px wide nothing scrolls horizontally.
- [ ] If `localStorage` is unavailable, clicking the button still clears the list for the current visit with no uncaught error (the existing `save()` try/catch covers this).
- [ ] `src/app.js` contains no filtering logic of its own for this feature. It calls `clearCompleted` imported from `./todos.js`.

## Tasks
1. **Add the pure clearCompleted function** (backend): In `src/todos.js`, add and export `clearCompleted(todos)` that returns `todos.filter((t) => !t.done)`. It must not mutate its input. Add a one-line comment only if the file's style calls for it.
2. **Add unit tests for clearCompleted** (tests): In `test/todos.test.js`, import `clearCompleted` and add tests for: mixed list keeps only not-done items in order, all done returns `[]`, none done leaves contents unchanged, empty input returns `[]`, input array is not mutated. Use the existing `node:test` and `assert/strict` style. Confirm `node --test` passes.
3. **Add the button markup** (frontend): In `index.html`, add `<button type="button" id="clear-completed" hidden>Clear completed</button>` directly after `<ul id="list"></ul>` and before or beside `<p id="count"></p>`. Keep the count visible. Place the button under the list as requested.
4. **Wire the button in app.js** (frontend): In `src/app.js`, import `clearCompleted`. Get the `#clear-completed` element. In `render()`, set `button.hidden = !todos.some((t) => t.done)`. Add a click handler that sets `todos = clearCompleted(todos)`, calls `save(todos)`, then `render()`.
5. **Check the styling** (frontend): Check in `src/style.css` that the existing `button` rule gives an acceptable look in light and dark mode, and that the `hidden` attribute really hides the button (no `display` rule overrides it). Add at most a small top margin if the button sits too close to the list. Do not add new colours.
6. **Manual verification and docs check** (tests): Open `index.html` and walk through the acceptance criteria: hidden at start, shown after ticking, hidden after unticking, clear, reload persistence, clearing everything. The README needs no change because setup and usage are unchanged. Confirm that, and add a one-line mention of the feature only if the README describes features.

## Out of scope
- A confirmation dialog or an undo for clearing.
- Showing how many tasks will be cleared in the button label (for example "Clear completed (3)").
- Deleting a single task, editing tasks, filters (All / Active / Completed) or reordering.
- Adding browser or DOM tests. Only the pure function gets automated tests, as requested.
- Changing the storage format or the `playground-todos` key.
- Adding dependencies, a build step or a test framework.

## Assumptions
- The function is named `clearCompleted(todos)`. The request only says "a pure function", so the name follows the existing `addTodo`, `toggleTodo` and `remainingCount` style.
- "Completed" means `done === true`, matching the existing todo shape `{ id, title, done }`.
- The button is hidden with the HTML `hidden` attribute, toggled in `render()`, rather than being created or removed from the DOM.
- Persistence reuses the existing `save()` and `load()` in `src/app.js`. No new storage code is needed.
- No confirmation or undo, because the request describes clicking as removing the tasks directly.
- Remaining ids are left as they are after clearing. `addTodo` uses max id + 1, so no collisions can happen.
- The repo already has `package.json` with `"type": "module"` and a `test` script of `node --test`, so no config changes are needed.
- Design review is flagged because a user-visible control is added, but the change is small. It reuses the existing global button style and only needs a quick check of placement under the list.
