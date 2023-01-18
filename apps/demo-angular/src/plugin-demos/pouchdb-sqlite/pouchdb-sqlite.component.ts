import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { getRxStorageLoki } from 'rxdb/plugins/lokijs';
import { RxDBCoreService, RXDB_STORAGE } from '../../replicator/rxdb-service';
import { LokiNativescriptAdapter } from '@herefishyfish/nativescript-lokijs';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { HeroComponent } from '../shared/hero.component';

@Component({
  selector: 'demo-nativescript-lokijs',
  templateUrl: '../shared/hero.page.html',
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
  imports: [NativeScriptCommonModule, HeroComponent],
  providers: [
    RxDBCoreService,
    {
      provide: RXDB_STORAGE,
      useFactory: () => {
        return getRxStorageLoki({
          env: 'NATIVESCRIPT',
          adapter: new LokiNativescriptAdapter(),
        });
      },
    },
  ],
})
export class NativescriptSQLitePouchDBComponent {
  adapter = 'SQLite PouchDB Adapter';
  constructor(public _rxdb: RxDBCoreService) {}
}
