/**
 * Local Storage RxDB Adapter Demo for NativeScript
 *
 * Uses @nativescript-use/nativescript-localstorage to polyfill localStorage in NativeScript
 * however there are many other localStorage polyfills that could be used instead.
 *
 * Notable localStorage polyfills:
 * - MMKVStorage: https://github.com/nativescript/plugins
 * - Canvas localStorage polyfill: https://github.com/nativescript/canvas/packages/canvas-polyfill
 */
import nsLocalStorage from '@nativescript-use/nativescript-localstorage';
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
        return getRxStorageLocalstorage({
          // Providing the NativeScript localStorage polyfill. This might not be required depending on the polyfill used.
          // For example, MMKVStorage does not require this as it patches global.localStorage directly.
          localStorage: nsLocalStorage as unknown as typeof localStorage,
        });
      },
    },
  ],
})
export class NativeScriptRxStorageLocalStorageComponent {
  adapter = 'RxStorage Local Storage Adapter';

  constructor(public _rxdb: RxDBCoreService) {}
}
