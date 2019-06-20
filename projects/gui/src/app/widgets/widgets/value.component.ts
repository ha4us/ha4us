import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core'

import { Ha4usWidget } from '../models'
import { load } from 'js-yaml'
@Component({
  selector: 'ha4us-value',
  template: `
    <div></div>
    <div
      [ngStyle]="css"
      *ha4us="let state of topic; ha4us as ha4us"
      [innerHtml]="state | template: template || default"
    ></div>
  `,
  styles: [
    ':host {height:100%;}',
    'div.value-div {height:100%;width:100%; box-sizing:border-box}',
  ],
  // encapsulation: ViewEncapsulation.None,
})
@Ha4usWidget({
  selector: 'value',
  label: 'Value',
  library: 'basic',

  height: 100,
  width: 60,
  props: [
    {
      id: 'topic',
      type: 'topic',
      placeholder: 'Topic',
      required: true,
    },
    {
      id: 'template',
      type: 'text',
      placeholder: 'Template',
      required: false,
    },
    {
      id: 'css',
      type: 'yaml',
      placeholder: 'CSS Definition',
      required: false,
    },
  ],
})
export class ValueComponent {
  default = '${val}'
  @Input() topic: string
  @Input() css: object
  @Input() template: string = undefined
}
