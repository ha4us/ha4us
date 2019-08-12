import { Component, Input } from '@angular/core'
import { Ha4usWidget } from '../models'

@Component({
  selector: 'ha4us-switch',
  template: `
    <mat-slide-toggle
      *ha4us="let mystate of topic; ha4us as ha4us"
      [checked]="mystate?.val"
      (change)="ha4us.set($event.checked)"
    >
      {{ placeholder }}
    </mat-slide-toggle>
  `,
})
@Ha4usWidget({
  selector: 'Toggle',
  label: 'Switch',
  library: 'basic',

  props: [
    {
      id: 'topic',
      type: 'topic',
      label: 'Topic',
      required: true,
    },
    {
      id: 'placeholder',
      type: 'string',
      label: 'Bezeichnung',
      required: false,
    },
  ],
})
export class SwitchComponent {
  @Input() topic: string
  @Input() placeholder: string
}
