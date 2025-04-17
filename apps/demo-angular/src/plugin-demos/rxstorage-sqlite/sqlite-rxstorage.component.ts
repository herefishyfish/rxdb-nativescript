import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { getSQLiteBasicsNativeScript } from '@herefishyfish/nativescript-sqlite-rxstorage-adapter';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { getRxStorageSQLite } from 'rxdb-premium/plugins/storage-sqlite';
import { RxDBCoreService, RXDB_STORAGE } from '../../replicator/rxdb-service';
import { HeroComponent } from '../shared/hero.component';

@Component({
  selector: 'demo-nativescript-sqlite',
  templateUrl: '../shared/hero.page.html',
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
  imports: [NativeScriptCommonModule, HeroComponent],
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
  adapter = 'SQLite RxStorage Adapter';
  constructor(public _rxdb: RxDBCoreService) {
    setTimeout(() => {
      this._rxdb.heros$.subscribe((heroes) => {
        console.log('Heroes:', heroes);
      });
    }, 5000);
  }
}
