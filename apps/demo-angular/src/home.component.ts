import { Component } from '@angular/core';

@Component({
  selector: 'demo-home',
  templateUrl: 'home.component.html',
})
export class HomeComponent {
  demos = [
    {
      name: 'nativescript-md5',
    },
    {
      name: 'rxstorage-memory',
    },
    {
      name: 'pouchdb-sqlite',
    },
  ];
}
