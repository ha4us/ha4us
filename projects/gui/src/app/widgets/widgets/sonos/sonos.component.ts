import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core'
import { Ha4usWidget } from '../../models'
@Component({
  selector: 'ha4us-sonos',
  templateUrl: './sonos.component.html',
  styleUrls: ['./sonos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@Ha4usWidget({
  selector: 'Device/Sonos',
  label: 'Sonos Lautsprecher',
  library: 'complex',
  props: [
    {
      id: 'topic',
      type: 'topic',
      label: 'Topic of Sonos Device',
      required: true,
    },
  ],
})
export class SonosComponent {
  @Input() topic: string
}
