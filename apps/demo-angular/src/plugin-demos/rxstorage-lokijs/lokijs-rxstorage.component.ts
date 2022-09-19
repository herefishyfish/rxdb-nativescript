import { Component } from '@angular/core';
import { getRxStorageLoki } from 'rxdb/plugins/lokijs';
import { RxDBCoreService, RXDB_STORAGE } from '../../replicator/rxdb-service';
import { LokiNativescriptAdapter } from '@herefishyfish/nativescript-lokijs-rxstorage';

@Component({
  selector: 'demo-nativescript-lokijs-rxstorage',
  templateUrl: 'lokijs-rxstorage.component.html',
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
export class NativescriptLokijsRxstorageComponent {
  constructor(public _rxdb: RxDBCoreService) {}
}
