import { Component } from '@angular/core';
import 'zone.js/dist/zone-patch-rxjs';

@Component({
  selector: 'demo-app',
  template: `<GridLayout>
    <page-router-outlet></page-router-outlet>
  </GridLayout>`,
})
export class AppComponent {}
