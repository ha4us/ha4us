import { Component, Input, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { take, map } from 'rxjs/operators'
import { Ha4usObject } from 'ha4us/core'

import { Ha4usWidget } from '@app/widgets'

import { ObjectService } from '@ha4us/ng'
@Component({
  templateUrl: './device-remote.component.html',
  styleUrls: ['./device-remote.component.scss'],
})
@Ha4usWidget({
  selector: 'Device/Remote',
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
export class DeviceRemoteComponent implements OnInit {
  @Input() topic: string

  constructor(protected os: ObjectService) {}

  ngOnInit() {}
}
