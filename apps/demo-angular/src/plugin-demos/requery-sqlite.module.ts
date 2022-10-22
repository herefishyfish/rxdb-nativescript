import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { RequerySqliteComponent } from './requery-sqlite.component';

@NgModule({
  imports: [NativeScriptCommonModule, NativeScriptRouterModule.forChild([{ path: '', component: RequerySqliteComponent }])],
  declarations: [RequerySqliteComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class RequerySqliteModule {}
