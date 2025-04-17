import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
// import { getRxStorageLoki } from 'rxdb/plugins/storage-lokijs';
import { NativeScriptCommonModule } from '@nativescript/angular';

@Component({
  selector: 'demo-nativescript-lokijs',
  // templateUrl: '../shared/hero.page.html',
  template: `<StackLayout>
    <Label class="h3"> LokiJS RxStorage Adapter (deprecated)</Label>
    <Label> This adapter was removed in version 16+ </Label>
    <Label> You will need to use 15 or lower if you want to use LokiJS </Label>
  </StackLayout> `,
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
  imports: [NativeScriptCommonModule],
  // providers: [
  //   RxDBCoreService,
  //   {
  //     provide: RXDB_STORAGE,
  //     useFactory: () => {
  //       return getRxStorageLoki({
  //         env: 'NATIVESCRIPT',
  //         adapter: new LokiNativescriptAdapter(),
  //       });
  //     },
  //   },
  // ],
})
export class NativescriptLokijsRxstorageComponent {
  adapter = 'LokiJS RxStorage Adapter (deprecated)';
  // constructor(public _rxdb: RxDBCoreService) {}
}
