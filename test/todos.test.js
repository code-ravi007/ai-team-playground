import { test } from "node:test";
import assert from "node:assert/strict";
import { addTodo, toggleTodo, remainingCount, clearCompleted } from "../src/todos.js";

test("adds a trimmed task with a new id", () => {
  const todos = addTodo([], "  buy milk ");
  assert.deepEqual(todos, [{ id: 1, title: "buy milk", done: false }]);
});

test("ignores empty tasks", () => {
  assert.deepEqual(addTodo([], "   "), []);
});

test("toggles a task and counts what is left", () => {
  let todos = addTodo(addTodo([], "a"), "b");
  todos = toggleTodo(todos, 1);
  assert.equal(todos[0].done, true);
  assert.equal(remainingCount(todos), 1);
});

test("clearing completed keeps only unfinished tasks in order", () => {
  const todos = [
    { id: 1, title: "a", done: true },
    { id: 2, title: "b", done: false },
    { id: 3, title: "c", done: true },
    { id: 4, title: "d", done: false },
  ];
  assert.deepEqual(clearCompleted(todos), [
    { id: 2, title: "b", done: false },
    { id: 4, title: "d", done: false },
  ]);
});

test("clearing completed when all are done returns an empty list", () => {
  const todos = [
    { id: 1, title: "a", done: true },
    { id: 2, title: "b", done: true },
  ];
  assert.deepEqual(clearCompleted(todos), []);
});

test("clearing completed when none are done leaves the list unchanged", () => {
  const todos = [
    { id: 1, title: "a", done: false },
    { id: 2, title: "b", done: false },
  ];
  assert.deepEqual(clearCompleted(todos), todos);
});

test("clearing completed on an empty list returns an empty list", () => {
  assert.deepEqual(clearCompleted([]), []);
});

test("clearing completed does not mutate the input", () => {
  const todos = [
    { id: 1, title: "a", done: true },
    { id: 2, title: "b", done: false },
  ];
  const before = structuredClone(todos);
  const result = clearCompleted(todos);
  assert.notEqual(result, todos);
  assert.deepEqual(todos, before);
});

test("adding after clearing gives a fresh, unique id", () => {
  let todos = addTodo(addTodo(addTodo([], "a"), "b"), "c");
  todos = toggleTodo(todos, 3);
  todos = clearCompleted(todos);
  todos = addTodo(todos, "d");
  assert.deepEqual(
    todos.map((t) => t.id),
    [1, 2, 3],
  );
  assert.equal(new Set(todos.map((t) => t.id)).size, todos.length);
});
