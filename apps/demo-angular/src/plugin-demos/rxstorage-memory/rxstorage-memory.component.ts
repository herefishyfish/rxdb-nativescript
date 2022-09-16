import { Component, NgZone } from '@angular/core';
import { DemoSharedNativescriptSqliteRxstorageAdapter } from '@demo/shared';
import { RxDBService } from './nativescript-rxdb.service';

@Component({
  selector: 'demo-nativescript-rxstorage-memory',
  templateUrl: 'rxstorage-memory.component.html',
  providers: [RxDBService],
})
export class NativeScriptRxStorageMemoryComponent {
  demoShared: DemoSharedNativescriptSqliteRxstorageAdapter;

  constructor(private _ngZone: NgZone, public _rxdb: RxDBService) {}

  ngOnInit() {
    this.demoShared = new DemoSharedNativescriptSqliteRxstorageAdapter();
  }
}
