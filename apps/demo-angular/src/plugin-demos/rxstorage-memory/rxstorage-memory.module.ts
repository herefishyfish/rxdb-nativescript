import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { RxDBService } from './nativescript-rxdb.service';
import { NativeScriptRxStorageMemoryComponent } from './rxstorage-memory.component';

@NgModule({
  imports: [NativeScriptCommonModule, NativeScriptRouterModule.forChild([{ path: '', component: NativeScriptRxStorageMemoryComponent }])],
  declarations: [NativeScriptRxStorageMemoryComponent],
  schemas: [NO_ERRORS_SCHEMA],
  // providers: [RxDBService]
})
export class NativeScriptRxStorageMemoryModule {}
