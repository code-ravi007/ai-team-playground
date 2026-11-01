import { test } from "node:test";
import assert from "node:assert/strict";
import { addTodo, toggleTodo, remainingCount } from "../src/todos.js";

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
