import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
// import 'zone.js/dist/zone-patch-rxjs';

@Component({
  selector: 'demo-app',
  template: `
    <GridLayout>
      <page-router-outlet></page-router-outlet>
    </GridLayout>
  `,
  schemas: [NO_ERRORS_SCHEMA],
  imports: [NativeScriptCommonModule, NativeScriptRouterModule],
})
export class AppComponent {}
