import { Component, Input } from '@angular/core'
import { Ha4usWidget } from '../models'

@Component({
  template: `
      <div *ngIf="topic | ha4usState as state" [style.background-color]="state.val?colTrue:colFalse">
      </div>
  `,
  styles: [
    `
      div {
        background-color: gray;
        height: 16px;
        width: 16px;
        border-radius: 50%;
      }
    `,
  ],
})
@Ha4usWidget({
  selector: 'Indicator',
  label: 'Indikator',
  props: [
    {
      id: 'topic',
      type: 'topic',
      label: 'Topic',
      required: true,
    },
    {
      id: 'colTrue',
      type: 'color',
      label: 'Farbe Wahr',
      required: true,
      default: 'red'
    },
    {
      id: 'colFalse',
      type: 'color',
      label: 'Farbe Wahr',
      required: true,
      default: 'green'
    },
  ],
})
export class IndicatorComponent {
  @Input() topic: string
}
