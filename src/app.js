import { addTodo, toggleTodo, remainingCount, clearCompleted } from "./todos.js";

const STORAGE_KEY = "playground-todos";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function save(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // Storage can be unavailable (private mode); the list still works for this visit.
  }
}

let todos = load();
const list = document.getElementById("list");
const count = document.getElementById("count");
const form = document.getElementById("add-form");
const input = document.getElementById("new-task");
const clearButton = document.getElementById("clear-completed");

function render() {
  list.replaceChildren(
    ...todos.map((t) => {
      const li = document.createElement("li");
      const label = document.createElement("label");
      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = t.done;
      box.addEventListener("change", () => {
        todos = toggleTodo(todos, t.id);
        save(todos);
        render();
      });
      label.append(box, " ", t.title);
      if (t.done) li.classList.add("done");
      li.append(label);
      return li;
    }),
  );
  const left = remainingCount(todos);
  count.textContent = `${left} ${left === 1 ? "task" : "tasks"} left`;
  clearButton.hidden = !todos.some((t) => t.done);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  todos = addTodo(todos, input.value);
  save(todos);
  input.value = "";
  render();
});

clearButton.addEventListener("click", () => {
  todos = clearCompleted(todos);
  save(todos);
  render();
  // The button hides itself, so give keyboard users a sensible place to land.
  input.focus();
});

render();
