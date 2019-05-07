import {
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Component,
  Input,
  OnInit,
} from '@angular/core'
import { ObjectService } from '@ha4us/ng'
import { Ha4usObject } from '@ha4us/core'

@Component({
  selector: 'ha4us-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DashboardCardComponent implements OnInit {
  @Input() object: Ha4usObject
  @Input() controlObject: Ha4usObject

  constructor(protected os: ObjectService) {}

  ngOnInit() {}

  edit(event: MouseEvent, topic: string) {
    console.log('Editing', topic)
    this.os.edit(topic)
  }
}
