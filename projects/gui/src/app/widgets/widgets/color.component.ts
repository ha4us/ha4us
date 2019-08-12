import { Component, Input } from '@angular/core'
import { Ha4usWidget } from '../models'

@Component({
  selector: 'ha4us-color',
  template: `
    <ha4us-color-picker
      *ha4us="let color of topic; ha4us as $color"
      [alpha]="false"
      [ngModel]="color.val"
      (ngModelChange)="$color.set($event)"
    >
    </ha4us-color-picker>
  `,
})
@Ha4usWidget({
  selector: 'Input/Color/Rgb',
  library: 'basic',
  label: 'Farbe',
  props: [
    {
      id: 'topic',
      type: 'topic',
      label: 'Topic',
      required: true,
    },
  ],
})
export class ColorComponent {
  @Input() topic: string
}
