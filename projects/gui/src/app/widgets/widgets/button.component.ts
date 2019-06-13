import { Component, Input } from '@angular/core'
import { Ha4usWidget } from '../models'
@Component({
  selector: 'ha4us-button',
  template: `
  <button mat-button *ha4us="topic; ha4us as ha4us" (click)="ha4us.set(value)">{{label}}</button>
  `,
  styles: ['button { width:100%}']
})
@Ha4usWidget({
  selector: 'Action',
  library: 'basic',
  label: 'Button',
  props: [
    {
      id: 'topic',
      type: 'topic',
      label: 'Topic',
      required: true,
      default: '',
    },
    {
      id: 'value',
      type: 'string',
      label: 'Wert',
      required: false,
      default: 'true',
    },
    {
      id: 'label',
      type: 'string',
      label: 'Beschriftung',
      required: false,
      default: 'Klick',
    },
  ],
})
export class ButtonComponent {
  @Input() topic: string
  @Input() value: any
  @Input() label: string
}
