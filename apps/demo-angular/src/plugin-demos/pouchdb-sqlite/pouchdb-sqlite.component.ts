import { Component, NgZone } from '@angular/core';
import { RxDBCoreService } from '../../replicator/rxdb-service';
@Component({
  selector: 'demo-nativescript-pouchdb-sqlite',
  templateUrl: 'pouchdb-sqlite.component.html',
  providers: [RxDBCoreService],
})
export class NativeScriptPouchDBSqliteComponent {
  constructor(private _ngZone: NgZone, public _rxdb: RxDBCoreService) {}
}
