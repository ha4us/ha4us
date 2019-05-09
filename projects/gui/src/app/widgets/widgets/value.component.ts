import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core'

import { Ha4usWidget } from '../models'

@Component({
  selector: 'ha4us-value',
  template: `
    <div [usCss]="css"></div>
    <div
      class="value-div"
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

  height: 100,
  width: 60,
  props: [
    {
      id: 'topic',
      type: 'topic',
      label: 'Topic',
      required: false,
    },
    {
      id: 'template',
      type: 'text',
      label: 'Template',
      required: true,
    },
    {
      id: 'css',
      type: 'text',
      label: 'CSS Definition',
      default: '',
      required: true,
    },
  ],
})
export class ValueComponent {
  default = '${val}'
  @Input() topic: string
  @Input() css: string
  @Input() template: string = undefined
  /* @Input() set role(role: string) {
    if (role && !this.template) {
      if (role.match(/\/Temperature/i)) {
        this.template = '${val?$format("%,1f",val):"N/A"} °C'
      } else if (role.match(/\/Humidity/i)) {
        this.template = '${val?val:"N/A"} %'
      } else if (role === 'Value/Electricity/Current') {
        this.template = '${val?$format("%,1f",val):"N/A"} A'
      } else if (role === 'Value/Electricity/Energy') {
        this.template = '${val?$format("%,2f",val/1000):"N/A"} kWh'
      } else if (role === 'Value/Electricity/Frequency') {
        this.template = '${val?$format("%,2f",val/1000):"N/A"} Hz'
      } else if (role === 'Value/Electricity/Power') {
        this.template = '${val?$format("%,1f",val):"N/A"} W'
      } else if (role === 'Value/Electricity/Voltage') {
        this.template = '${val?$format("%,1f",val):"N/A"} V'
      } /*else if (role.match(/\/Price/i)) {
        this.template = '${val?$format("%,2f",val):"N/A"} €'
      }
}
  }*/
}
