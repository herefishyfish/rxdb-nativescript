import { Application } from '@nativescript/core';

// Replaces the `unload` package (used by broadcast-channel), which expects `window` or Node's `process`.
const listeners = new Set<() => unknown>();
let listening = false;

export function runAll() {
  return Promise.all([...listeners].map((fn) => fn()));
}

export function add(fn: () => unknown) {
  if (!listening) {
    listening = true;
    Application.on(Application.exitEvent, runAll);
  }
  listeners.add(fn);
  return {
    remove: () => listeners.delete(fn),
    run: () => {
      listeners.delete(fn);
      return fn();
    },
  };
}

export function removeAll() {
  listeners.clear();
}

export function getSize() {
  return listeners.size;
}
