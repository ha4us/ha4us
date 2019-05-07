import { Component } from '@angular/core'
import { Ha4usWidget } from '../models'

@Component({
  template: `
      <ng-container *ha4us="let state of stateTopic">
        <button [style.backgroundColor]="state?.val ? colorTrue :colorFalse"
          mat-fab *ha4us="let action of actionTopic; ha4us as ha4us"
          (click)="ha4us.set(actionValue)">
        <ha4us-media color="white" [style.transform]="'translateY(-6px)'" size="36"
         [media]="state?.val? iconTrue:iconFalse"></ha4us-media></button>
      </ng-container>
  `,
  styles: [
    `
      .ha4us-widget-indicator {
        background-color: #666666;
        background-repeat: space;
        background-position: center;
        height: 40px;
        width: 40px;
        border-radius: 50%;
      }
    `,
  ],
})
@Ha4usWidget({
  selector: 'indicator_button',
  label: 'Status Taster',
  props: [
    {
      id: 'actionTopic',
      type: 'topic',
      label: 'Aktions Topic',
      required: true,
    },
    {
      id: 'actionValue',
      type: 'string',
      label: 'Aktions Wert',
      required: false,
      default: 'true',
    },
    {
      id: 'stateTopic',
      type: 'topic',
      label: 'Status Topic',
      required: true,
    },
    {
      id: 'iconTrue',
      type: 'media[image/svg]',
      label: 'Bild, wenn wahr',
      required: false,
    },
    {
      id: 'colorTrue',
      type: 'color',
      label: 'Farbe, wenn wahr',
      required: false,
    },
    {
      id: 'iconFalse',
      type: 'media[image/svg]',
      label: 'Bild, wenn falsch',
      required: false,
    },
    {
      id: 'colorFalse',
      type: 'color',
      label: 'Farbe, wenn falsch',
      required: false,
    },
    {
      id: 'format',
      type: 'array',
      label: 'Formate',
      max: 4,
      min: 1,
      controls: [
        {
          id: 'if',
          label: 'Wenn Wert =',
          type: 'string',
          required: false,
        },
        {
          id: 'thenColor',
          label: 'Dann Farbe =>',
          type: 'color',
          required: false,
        },
        {
          id: 'thenBackground',
          label: 'Dann Hintergrund =>',
          type: 'color',
          required: false,
        },

        {
          id: 'thenImage',
          label: 'Dann Bild =>',
          type: 'media[image/svg]',
          required: false,
        },
      ],
    },
  ],
})
export class IndicatorButtonComponent {
  actionTopic: string
  actionValue: string
  stateTopic: string
  iconTrue: string
  iconFalse: string
  colorTrue: string
  colorFalse: string
}
