import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { HeroComponent } from '../../components/hero.component';
import { NativescriptSQLiteRxstorageComponent } from './sqlite-rxstorage.component';

@NgModule({
  imports: [NativeScriptCommonModule, NativeScriptRouterModule.forChild([{ path: '', component: NativescriptSQLiteRxstorageComponent }]), HeroComponent],
  declarations: [NativescriptSQLiteRxstorageComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class NativescriptSQLiteRxstorageModule {}
