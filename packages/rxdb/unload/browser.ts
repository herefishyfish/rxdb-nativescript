import { Application } from '@nativescript/core';

function add(fn) {
  Application.on('exit', function () {
    fn();
  });
}

export default {
  add,
};
