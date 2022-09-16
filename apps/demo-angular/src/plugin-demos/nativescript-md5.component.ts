import { Component, NgZone } from '@angular/core';
import { DemoSharedNativescriptMd5 } from '@demo/shared';

@Component({
  selector: 'demo-nativescript-md5',
  templateUrl: 'nativescript-md5.component.html',
})
export class NativescriptMd5Component {
  demoShared: DemoSharedNativescriptMd5;

  constructor(private _ngZone: NgZone) {}

  ngOnInit() {
    this.demoShared = new DemoSharedNativescriptMd5();
  }
}
