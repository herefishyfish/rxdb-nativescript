import localStorage from '@nativescript-use/nativescript-localstorage';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { RXDB_STORAGE, RxDBCoreService } from '../../replicator/rxdb-service';
import { getRxStorageLocalstorage } from 'rxdb/plugins/storage-localstorage';
import { HeroComponent } from '../shared/hero.component';

@Component({
  selector: 'demo-nativescript-rxstorage-localstorage',
  templateUrl: '../shared/hero.page.html',
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
  imports: [NativeScriptCommonModule, HeroComponent],
  providers: [
    RxDBCoreService,
    {
      provide: RXDB_STORAGE,
      useFactory: () => {
        return getRxStorageLocalstorage();
      },
    },
  ],
})
export class NativeScriptRxStorageLocalStorageComponent {
  adapter = 'RxStorage Local Storage Adapter';

  constructor(public _rxdb: RxDBCoreService) {}
}
