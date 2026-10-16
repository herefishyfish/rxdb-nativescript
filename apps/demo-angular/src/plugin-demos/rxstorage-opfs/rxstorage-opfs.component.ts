import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { getRxStorageOPFSMainThread } from 'rxdb-premium/plugins/storage-opfs';
import { RxDBCoreService, RXDB_STORAGE } from '../../replicator/rxdb-service';
import { HeroComponent } from '../shared/hero.component';
import { installOPFSPolyfill } from '@herefishyfish/nativescript-opfs';

installOPFSPolyfill();

@Component({
  selector: 'demo-nativescript-rxstorage-opfs',
  templateUrl: '../shared/hero.page.html',
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
  imports: [NativeScriptCommonModule, HeroComponent],
  providers: [
    RxDBCoreService,
    {
      provide: RXDB_STORAGE,
      useFactory: () => getRxStorageOPFSMainThread(),
    },
  ],
})
export class NativeScriptRxStorageOpfsComponent {
  adapter = 'RxStorage OPFS Adapter';

  constructor(public _rxdb: RxDBCoreService) {}
}
