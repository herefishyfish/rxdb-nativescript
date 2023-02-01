import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { getRxStorageLoki } from 'rxdb/plugins/lokijs';
import { RxDBCoreService, RXDB_STORAGE } from '../../replicator/rxdb-service';
import { addPouchPlugin, getRxStoragePouch } from 'rxdb/plugins/pouchdb';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { HeroComponent } from '../shared/hero.component';
import HttpPouch from 'pouchdb-adapter-http';
import { createPlugin } from '@herefishyfish/nativescript-pouchdb-sqlite-adapter';

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
        const SQLiteAdapter = createPlugin();

        addPouchPlugin(SQLiteAdapter);

        return getRxStoragePouch('nativescript-sqlite');
      },
    },
  ],
})
export class NativescriptSQLitePouchDBComponent {
  adapter = 'SQLite PouchDB Adapter';
  constructor(public _rxdb: RxDBCoreService) {}
}
