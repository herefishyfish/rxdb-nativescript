import { Component, inject, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { Dialogs } from '@nativescript/core';
import { RxDBCoreService } from '../../replicator/rxdb-service';
import { RxHeroDocumentType } from '../../schemas/hero.schema';
import { RxDocument } from 'rxdb';

@Component({
  selector: 'app-hero',
  template: `
    <StackLayout class="hero-card" (tap)="onTap()" (longPress)="deleteHero()" orientation="horizontal">
      <Label text="{{ hero?.name }}'s favorite color is: " textWrap="true"></Label>
      <StackLayout width="20" height="20" [backgroundColor]="hero?.color"></StackLayout>
    </StackLayout>
  `,
  styles: [
    `
      .hero-card {
        border-radius: 4;
        border-width: 1;
        border-color: #d3d3d4;
        padding: 10;
        width: 100%;
        margin-bottom: 8;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
      }
    `,
  ],
  standalone: true,
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
})
export class HeroComponent {
  @Input() hero!: RxDocument<RxHeroDocumentType>;
  _rxdb = inject(RxDBCoreService);

  onTap() {
    Dialogs.prompt('Change hero name', this.hero.name).then((promptResult) => {
      if (promptResult.result == true) {
        this._rxdb.database.heroes.upsert({
          id: this.hero.id,
          color: this.hero.color,
          name: promptResult.text,
          updatedAt: new Date().toISOString(),
        });
      }
    });
  }

  deleteHero() {
    Dialogs.confirm({
      title: 'Delete hero',
      message: `Are you sure you want to delete ${this.hero.name}?`,
      cancelButtonText: 'Cancel',
      okButtonText: 'Delete',
    }).then((result) => {
      if (result) {
        this.hero.remove();
      }
    });
  }
}
