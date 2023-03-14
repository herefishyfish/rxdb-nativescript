import { Component, NgZone, NO_ERRORS_SCHEMA } from '@angular/core';
import { DemoSharedNativescriptSqliteRxstorageAdapter } from '@demo/shared';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { RxDBCoreService, RXDB_STORAGE } from '../../replicator/rxdb-service';
import { HeroComponent } from '../shared/hero.component';

@Component({
  selector: 'demo-nativescript-rxstorage-memory',
  templateUrl: '../shared/hero.page.html',
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
  imports: [NativeScriptCommonModule, HeroComponent],
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
  adapter = 'RxStorage Memory Adapter';

  constructor(public _rxdb: RxDBCoreService) {}
}
