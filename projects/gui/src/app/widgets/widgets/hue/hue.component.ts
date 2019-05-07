import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core'
import { Ha4usWidget } from '../../models'

@Component({
  selector: 'ha4us-hue',
  templateUrl: './hue.component.html',
  styleUrls: ['./hue.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@Ha4usWidget({
  selector: 'Device/Hue*',
  label: 'Hue Bedienung',
  library: 'basic',
  props: [
    {
      id: 'topic',
      type: 'topic',
      label: 'Topic of hue device',
      required: true,
    },
  ],
})
export class HueComponent implements OnInit {
  @Input() topic: string
  constructor() {}

  ngOnInit() {}
}
