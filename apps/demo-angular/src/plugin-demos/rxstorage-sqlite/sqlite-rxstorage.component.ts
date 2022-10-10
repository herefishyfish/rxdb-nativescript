import { Component } from '@angular/core';
import { getSQLiteBasicsNativeScript } from '@herefishyfish/nativescript-sqlite-rxstorage-adapter';
import { getRxStorageSQLite } from 'rxdb-premium/plugins/sqlite';
import { RxDBCoreService, RXDB_STORAGE } from '../../replicator/rxdb-service';

@Component({
  selector: 'demo-nativescript-sqlite',
  templateUrl: 'sqlite-rxstorage.component.html',
  providers: [
    RxDBCoreService,
    {
      provide: RXDB_STORAGE,
      useFactory: () => {
        return getRxStorageSQLite({
          sqliteBasics: getSQLiteBasicsNativeScript(),
        });
      },
    },
  ],
})
export class NativescriptSQLiteRxstorageComponent {
  constructor(public _rxdb: RxDBCoreService) {}
}
