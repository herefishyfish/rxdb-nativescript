import { Application } from '@nativescript/core';

export function addBrowser(fn) {
  Application.on('exit', function () {
    fn();
  });
}
