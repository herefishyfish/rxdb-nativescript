import { Application } from '@nativescript/core';

function add(fn) {
  Application.on('suspend', function () {
    fn();
  });
  // Application.on('exit', function() {
  //   fn();
  // });
}

export default {
  add: add,
};
