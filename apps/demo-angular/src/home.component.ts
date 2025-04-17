import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';

@Component({
  selector: 'demo-home',
  templateUrl: 'home.component.html',
  schemas: [NO_ERRORS_SCHEMA],
  imports: [NativeScriptCommonModule, NativeScriptRouterModule],
})
export class HomeComponent {
  demos = [
    {
      name: 'rxstorage-memory',
    },
    {
      name: 'sqlite-rxstorage',
    },
    {
      name: 'lokijs-rxstorage',
    },
  ];
}
