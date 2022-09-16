import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { NativeScriptRxStorageMemoryComponent } from './rxstorage-memory.component';
import { HeroComponent } from '../../components/hero.component';

@NgModule({
  imports: [NativeScriptCommonModule, NativeScriptRouterModule.forChild([{ path: '', component: NativeScriptRxStorageMemoryComponent }]), HeroComponent],
  declarations: [NativeScriptRxStorageMemoryComponent],
  schemas: [NO_ERRORS_SCHEMA],
  // providers: [RxDBService]
})
export class NativeScriptRxStorageMemoryModule {}
