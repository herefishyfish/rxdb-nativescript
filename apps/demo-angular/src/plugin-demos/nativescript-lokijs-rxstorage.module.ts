import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { NativescriptLokijsRxstorageComponent } from './nativescript-lokijs-rxstorage.component';

@NgModule({
  imports: [NativeScriptCommonModule, NativeScriptRouterModule.forChild([{ path: '', component: NativescriptLokijsRxstorageComponent }])],
  declarations: [NativescriptLokijsRxstorageComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class NativescriptLokijsRxstorageModule {}
