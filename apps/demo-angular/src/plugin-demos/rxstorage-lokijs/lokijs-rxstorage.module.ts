import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { HeroComponent } from '../../components/hero.component';
import { NativescriptLokijsRxstorageComponent } from './lokijs-rxstorage.component';

@NgModule({
  imports: [NativeScriptCommonModule, NativeScriptRouterModule.forChild([{ path: '', component: NativescriptLokijsRxstorageComponent }]), HeroComponent],
  declarations: [NativescriptLokijsRxstorageComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class NativescriptLokijsRxstorageModule {}
