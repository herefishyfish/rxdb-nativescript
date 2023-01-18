import { Component } from '@angular/core';

@Component({
  selector: 'demo-home',
  templateUrl: 'home.component.html',
})
export class HomeComponent {
  demos = [
    {
      name: 'lokijs-rxstorage',
    },
    {
      name: 'sqlite-rxstorage',
    },
    {
      name: 'rxstorage-memory',
    },
    {
      name: 'pouchdb-sqlite',
    },
  ];
}
