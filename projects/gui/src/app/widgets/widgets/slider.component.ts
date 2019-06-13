import { Component, Input, OnInit } from '@angular/core'
import { Ha4usWidget } from '../models'

@Component({
  selector: 'ha4us-slider',
  template: `
    <mat-slider
      *ha4us="let state of topic; ha4us as ha4us"
      [max]="max"
      [min]="min"
      [vertical]="vertical"
      thumbLabel
      [value]="round(state?.val / factor)"
      (change)="ha4us.set(precisionRound($event.value * factor, 2))"
    >
    </mat-slider>
  `,
  styles: ['mat-slider {width:100%}'],
})
@Ha4usWidget({
  selector: 'Range',
  label: 'Slider',
  library: 'basic',
  height: 148,
  width: 148,
  props: [
    {
      id: 'topic',
      type: 'topic',
      label: 'Topic',
      required: true,
      default: '',
    },
    {
      id: 'factor',
      type: 'number',
      label: 'Faktor',
      required: true,
      default: 1,
    },
    {
      id: 'min',
      type: 'number',
      label: 'Min',
      required: true,
      default: 1,
    },
    {
      id: 'max',
      type: 'number',
      label: 'Max',
      required: true,
      default: 100,
    },
    {
      id: 'vertical',
      type: 'boolean',
      label: 'Vertikal',
      required: false,
      default: false,
    },
  ],
})
export class SliderComponent {
  @Input() topic: string
  @Input() factor = 1
  @Input() min = 1
  @Input() max = 100
  @Input() vertical: boolean

  public round(value: number): number {
    return Math.round(value)
  }

  public precisionRound(number, precision) {
    const factor = Math.pow(10, precision)
    return Math.round(number * factor) / factor
  }
}
