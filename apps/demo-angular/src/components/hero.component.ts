import { Component, EventEmitter, Input, NO_ERRORS_SCHEMA, Output } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { RxHeroDocumentType } from '../schemas/hero.schema';

@Component({
  selector: 'app-hero',
  template: `
    <StackLayout class="hero-card" (tap)="onTap($event)" orientation="horizontal">
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
  @Input() hero!: RxHeroDocumentType;
  @Output() heroTapped = new EventEmitter();

  onTap(event) {
    console.log(`${this.hero?.name ?? ''} tapped!`);
    this.heroTapped.emit(event);
  }
}
