import { Component, NgZone } from '@angular/core';
import { DemoSharedRequerySqlite } from '@demo/shared';

@Component({
  selector: 'demo-requery-sqlite',
  templateUrl: 'requery-sqlite.component.html',
})
export class RequerySqliteComponent {
  demoShared: DemoSharedRequerySqlite;

  constructor(private _ngZone: NgZone) {}

  ngOnInit() {
    this.demoShared = new DemoSharedRequerySqlite();
  }
}
