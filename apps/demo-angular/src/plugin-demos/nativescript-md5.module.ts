import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { NativescriptMd5Component } from './nativescript-md5.component';

@NgModule({
  imports: [NativeScriptCommonModule, NativeScriptRouterModule.forChild([{ path: '', component: NativescriptMd5Component }])],
  declarations: [NativescriptMd5Component],
  schemas: [NO_ERRORS_SCHEMA],
})
export class NativescriptMd5Module {}
