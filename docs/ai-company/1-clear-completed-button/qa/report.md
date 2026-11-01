# QA report: "Clear completed" button (round 1)

**Verdict:** pass

## Environment
- Branch `ai/1-clear-completed-button`. Static site served with `python3 -m http.server 8000`.
- Google Chrome (headless) driven by Playwright for Python 1.64.
- Viewports: 1280x800, 800x600 (dark mode), 375, 360 and 320 px wide.
- `npm test`: 9 tests pass (3 existing and 6 new), exit 0.

## Results
| # | Test case | Result | Screenshot |
|---|---|---|---|
| 1 | Empty first load: button hidden (has `hidden`, takes no space), "0 tasks left" | ✅ | `01-empty.png` |
| 2 | Todos present, none ticked: button hidden | ✅ | |
| 3 | Tick one task: button appears with no reload | ✅ | `02-two-ticked.png` |
| 4 | Untick the last ticked task: button hides | ✅ | |
| 5 | Click: ticked tasks removed, order of the rest kept, count text unchanged ("2 tasks left"), button hidden | ✅ | `03-after-clear.png` |
| 6 | Reload after clearing: only remaining tasks shown (read from `playground-todos`) | ✅ | |
| 7 | Add a task after clearing: ids unique (`[1,3,4]`) | ✅ | |
| 8 | Keyboard: Tab reaches the button, Enter clears, Space clears; focus moves to "New task" input | ✅ | `04-focus-light.png` |
| 9 | Clear everything: empty list, "0 tasks left", button hidden; the same after reload; next added task gets id 1 | ✅ | |
| 10 | No uncaught errors or console errors during the flows (only a 404 for `/favicon.ico` from the static server, unrelated) | ✅ | |
| 11 | 375, 360 and 320 px: no horizontal scroll, button fully visible | ✅ | `05-small-360.png` |
| 12 | Dark mode: button uses the shared accent style, focus ring visible | ✅ | `06-dark.png`, `07-dark-focus.png` |
| 13 | `localStorage` throws: tasks can be added and cleared for the visit, no page error | ✅ | |
| 14 | `app.js` has no filtering of its own; it calls the imported `clearCompleted`. Button markup matches the spec and sits after `<ul id="list">`. Label is exactly "Clear completed" | ✅ | |

## Bugs
None.

## Notes (not failures)
- Dark mode: white text on the `#8aa2ff` accent has low contrast (about 2.4:1). It is visible in `06-dark.png`. The existing "Add" button has the same problem, and the spec forbids new colours. It is suggested as a follow-up.
- Nothing is announced to screen-reader users when tasks are cleared. This is outside the spec.
- The button is about 40 px high, which is slightly under the 44 px target. It matches "Add".
- The browser's default focus ring is clearly visible on both light and dark backgrounds.

## Not tested
- Real screen readers.
- Browsers other than Chromium.
- Opening via `file://`. The page uses an ES module, which many browsers block on `file://`, so it was served over HTTP.
