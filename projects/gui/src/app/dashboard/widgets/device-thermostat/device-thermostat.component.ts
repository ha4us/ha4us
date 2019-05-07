import { Component, ChangeDetectionStrategy, Input } from '@angular/core'
import { Ha4usWidget } from '@app/widgets'
@Component({
  templateUrl: './device-thermostat.component.html',
  styleUrls: ['./device-thermostat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@Ha4usWidget({
  selector: 'Device/Thermostat',
  label: 'Thermostat',
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
export class DeviceThermostatComponent {
  @Input() topic: string
}
