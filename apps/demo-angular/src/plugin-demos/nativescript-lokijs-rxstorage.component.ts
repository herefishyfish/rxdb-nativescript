import { Component, NgZone } from '@angular/core';
import { DemoSharedNativescriptLokijsRxstorage } from '@demo/shared';

@Component({
  selector: 'demo-nativescript-lokijs-rxstorage',
  templateUrl: 'nativescript-lokijs-rxstorage.component.html',
})
export class NativescriptLokijsRxstorageComponent {
  demoShared: DemoSharedNativescriptLokijsRxstorage;

  constructor(private _ngZone: NgZone) {}

  ngOnInit() {
    this.demoShared = new DemoSharedNativescriptLokijsRxstorage();
  }
}
