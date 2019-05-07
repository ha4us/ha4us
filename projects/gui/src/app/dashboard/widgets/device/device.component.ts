import { Component, OnInit, Input } from '@angular/core'

import { Observable } from 'rxjs'
import { take, map } from 'rxjs/operators'
import { Ha4usObject } from '@ha4us/core'

import { Ha4usWidget } from '@app/widgets'

import { ObjectService } from '@ha4us/ng'

const NO_SYSTEM_ROLES = /^(Device|.*\/System\/)/i
@Component({
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss'],
})
@Ha4usWidget({
  selector: 'Device',
  label: 'Gerät',
  library: 'dashboard',
  props: [
    {
      id: 'topic',
      type: 'topic',
      label: 'Topic',
      required: true,
    },
  ],
})
export class DeviceWidgetComponent implements OnInit {
  @Input() topic: string

  children: Observable<Ha4usObject[]>
  object: Ha4usObject

  constructor(protected os: ObjectService) {}

  ngOnInit() {
    this.children = this.os.observe(this.topic + '/+')
  }
}
