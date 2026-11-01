// Pure to-do list logic, kept separate from the page so it can be tested.

export function addTodo(todos, text) {
  const title = String(text).trim();
  if (!title) return todos;
  const id = todos.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  return [...todos, { id, title, done: false }];
}

export function toggleTodo(todos, id) {
  return todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

export function remainingCount(todos) {
  return todos.filter((t) => !t.done).length;
}

export function clearCompleted(todos) {
  return todos.filter((t) => !t.done);
}
