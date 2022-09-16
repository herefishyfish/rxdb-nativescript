import { Component, NgZone } from '@angular/core';
import { RxDBService } from './nativescript-rxdb.service';

@Component({
  selector: 'demo-nativescript-pouchdb-sqlite',
  templateUrl: 'pouchdb-sqlite.component.html',
  providers: [RxDBService],
})
export class NativeScriptPouchDBSqliteComponent {
  constructor(private _ngZone: NgZone, public _rxdb: RxDBService) {}
}
