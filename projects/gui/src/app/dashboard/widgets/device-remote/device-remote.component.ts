import { Component, Input } from '@angular/core'

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
export class DeviceRemoteComponent {
  @Input() topic: string
}
