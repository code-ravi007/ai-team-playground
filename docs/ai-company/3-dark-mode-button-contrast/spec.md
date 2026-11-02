# Spec: Fix low-contrast button text in dark mode

In dark mode the buttons ("Add" and "Clear completed") use white text on the light blue accent (#8aa2ff). That is about 2.4:1 contrast, which is hard to read. We will add a separate button text colour variable so dark mode uses dark text on the accent (about 7.7:1). Light mode stays unchanged.

## User stories
- As a user with a dark colour scheme, I can read the labels on the Add and Clear completed buttons so that I can tell what they do.
- As a user with a light colour scheme, I see the buttons exactly as before so that nothing regresses.

## Acceptance criteria
- [ ] src/style.css defines a new custom property --accent-fg in :root with value #ffffff (light mode) and overrides it to #111113 inside the prefers-color-scheme: dark block.
- [ ] The button rule uses color: var(--accent-fg) instead of the hard-coded #fff; the background stays var(--accent).
- [ ] In dark mode, button text (#111113) on background (#8aa2ff) has a WCAG contrast ratio of at least 4.5:1 (about 7.7:1), checked for both the 'Add' button and the 'Clear completed' button.
- [ ] In light mode, button text stays #fff on #3a5bd9 (about 5.5:1) and looks identical to before.
- [ ] No other colours, layout, spacing or markup change; index.html and src/app.js are untouched.
- [ ] Buttons are readable in dark mode when the 'Clear completed' button is visible (at least one task is completed) as well as when it is hidden.
- [ ] `npm test` (node --test) still passes.

## Tasks
1. **Add button text colour variable** (frontend): In src/style.css add --accent-fg: #ffffff to the :root light defaults and --accent-fg: #111113 to the dark prefers-color-scheme override.
2. **Use the variable on buttons** (frontend): Change the `button` rule in src/style.css to use color: var(--accent-fg) in place of #fff.
3. **Verify contrast and regressions** (tests): Check in a browser with the OS or devtools set to dark and then light. Confirm both buttons (including Clear completed with a completed task) meet 4.5:1 in dark mode and are unchanged in light mode. Run npm test. Optionally add a node --test that parses src/style.css and checks that the dark --accent-fg and --accent pair meets 4.5:1.
4. **Changelog entry** (docs): Add a line to CHANGELOG.md under the unreleased or latest section: 'Fixed: button text is now readable in dark mode.'

## Out of scope
- Adding a manual light/dark theme toggle.
- Redesigning the button style, accent colours, hover/focus/active states or the palette.
- Contrast changes for non-button text, the input field or muted text.
- High-contrast or forced-colors mode support.

## Assumptions
- 'Buttons' means the two buttons in the app: Add and Clear completed. Both share the single `button` CSS rule.
- The problem is the white text on the light dark-mode accent (#8aa2ff, about 2.4:1), not the button size or shape.
- Keeping the dark-mode accent background and changing the text colour is the smallest fix; the accent is also used nowhere else in the stylesheet.
- A WCAG AA ratio of 4.5:1 for normal text is the target.
- The page follows the OS setting through prefers-color-scheme; there is no manual theme switch.
- No designer is needed: this is a one-colour token change with exact values specified here.
