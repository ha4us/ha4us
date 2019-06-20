import { Component, OnInit, Input } from '@angular/core'

import { Observable, Subject } from 'rxjs'
import { take, map, switchMap } from 'rxjs/operators'
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
  topic$: Subject<string> = new Subject()
  @Input() set topic(topic: string) {
    this.topic$.next(topic)
  }

  children = this.topic$.pipe(
    switchMap(topic => this.os.observe(topic + '/+'))
  )

  constructor(protected os: ObjectService) {}

  ngOnInit() {}
}
