import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/style.css", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

// The light defaults are the first top-level :root block; the dark overrides
// live in the :root block inside the prefers-color-scheme: dark media query.
const lightRoot = css.match(/^:root\s*\{([^}]*)\}/m)?.[1];
const darkRoot = css.match(
  /@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*\{\s*:root\s*\{([^}]*)\}/,
)?.[1];

function customProperty(block, name) {
  const value = block?.match(new RegExp(`${name}\\s*:\\s*([^;]+);`))?.[1];
  assert.ok(value, `${name} is not defined`);
  return value.trim();
}

function rule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\#]/g, "\\$&");
  const body = css.match(new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`, "m"))?.[1];
  assert.ok(body, `no rule for ${selector}`);
  return body;
}

function hexToRgb(hex) {
  const digits = hex.replace(/^#/, "");
  assert.match(digits, /^([0-9a-f]{3}|[0-9a-f]{6})$/i, `${hex} is not a hex colour`);
  const full = digits.length === 3 ? [...digits].map((d) => d + d).join("") : digits;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

// WCAG 2.x relative luminance and contrast ratio.
function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

test("contrast helper matches known WCAG values", () => {
  assert.equal(contrast("#000000", "#ffffff"), 21);
  assert.equal(contrast("#fff", "#fff"), 1);
});

test("light mode defines --accent-fg as white on the unchanged accent", () => {
  assert.equal(customProperty(lightRoot, "--accent-fg").toLowerCase(), "#ffffff");
  assert.equal(customProperty(lightRoot, "--accent").toLowerCase(), "#3a5bd9");
});

test("dark mode overrides --accent-fg with dark text on the unchanged accent", () => {
  assert.equal(customProperty(darkRoot, "--accent-fg").toLowerCase(), "#111113");
  assert.equal(customProperty(darkRoot, "--accent").toLowerCase(), "#8aa2ff");
});

test("button text meets WCAG AA (4.5:1) in dark mode", () => {
  const ratio = contrast(customProperty(darkRoot, "--accent-fg"), customProperty(darkRoot, "--accent"));
  assert.ok(ratio >= 4.5, `dark button contrast is ${ratio.toFixed(2)}:1`);
});

test("button text meets WCAG AA (4.5:1) in light mode", () => {
  const ratio = contrast(customProperty(lightRoot, "--accent-fg"), customProperty(lightRoot, "--accent"));
  assert.ok(ratio >= 4.5, `light button contrast is ${ratio.toFixed(2)}:1`);
});

test("the button rule uses the accent tokens for text and background", () => {
  const button = rule("button");
  assert.match(button, /(^|;)\s*color:\s*var\(--accent-fg\)\s*;/);
  assert.match(button, /background:\s*var\(--accent\)\s*;/);
  assert.doesNotMatch(button, /color:\s*#/);
});

test("Add and Clear completed both get their colours from the shared button rule", () => {
  for (const label of ["Add", "Clear completed"]) {
    const tag = html.match(new RegExp(`<button\\b([^>]*)>\\s*${label}\\s*</button>`))?.[1];
    assert.ok(tag !== undefined, `no <button> labelled "${label}"`);
    assert.doesNotMatch(tag, /\bstyle=/, `"${label}" has inline styles`);
  }
  // Nothing more specific than `button` may override the text colour.
  const overrides = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].filter(
    ([, selector, body]) =>
      selector.trim() !== "button" &&
      /button|#clear-completed|\[type/.test(selector) &&
      /(^|;)\s*(color|background)\s*:/.test(body),
  );
  assert.deepEqual(overrides.map(([, selector]) => selector.trim()), []);
});
