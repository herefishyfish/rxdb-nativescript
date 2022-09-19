import { Component, NgZone } from '@angular/core';
import { DemoSharedNativescriptSqliteRxstorageAdapter } from '@demo/shared';
import { getRxStorageMemory } from 'rxdb/plugins/memory';
import { RxDBCoreService, RXDB_STORAGE } from '../../replicator/rxdb-service';
@Component({
  selector: 'demo-nativescript-rxstorage-memory',
  templateUrl: 'rxstorage-memory.component.html',
  providers: [
    RxDBCoreService,
    {
      provide: RXDB_STORAGE,
      useFactory: () => {
        return getRxStorageMemory();
      },
    },
  ],
})
export class NativeScriptRxStorageMemoryComponent {
  demoShared: DemoSharedNativescriptSqliteRxstorageAdapter;

  constructor(private _ngZone: NgZone, public _rxdb: RxDBCoreService) {}

  ngOnInit() {
    this.demoShared = new DemoSharedNativescriptSqliteRxstorageAdapter();
  }
}
