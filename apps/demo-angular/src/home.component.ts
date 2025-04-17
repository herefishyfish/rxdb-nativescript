import { Component } from '@angular/core';

@Component({
  selector: 'demo-home',
  standalone: false,
  templateUrl: 'home.component.html',
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
