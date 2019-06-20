import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  DoCheck,
} from '@angular/core'
import { DashboardCard } from '@app/dash2/state/dashboard.model'

import Debug from 'debug'
const debug = Debug('ha4us:gui:dash2:card')
@Component({
  selector: 'ha4us-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.scss'],
})
export class DashboardCardComponent implements OnInit, DoCheck {
  constructor() {}

  @Input() card: DashboardCard

  @Output() delete = new EventEmitter<void>()
  @Output() edit = new EventEmitter<void>()

  @ViewChild('card') cardElement: ElementRef<HTMLElement>
  lastHeight = 0

  @Output() change = new EventEmitter<void>()

  @Output() heightChange = new EventEmitter<number>()

  ngOnInit() {}

  height2rows(height: number) {
    // return Math.ceil((height + this.gap) / (10))
    return Math.ceil(height / 10)
  }

  ngDoCheck(): void {
    if (
      this.cardElement.nativeElement.clientHeight > 0 &&
      (!this.lastHeight ||
        this.lastHeight !== this.cardElement.nativeElement.clientHeight)
    ) {
      this.lastHeight = this.cardElement.nativeElement.clientHeight
      this.heightChange.emit(this.lastHeight)
      debug(
        'Rows',
        this.card.id,
        this.lastHeight,
        this.height2rows(this.lastHeight)
      )
    }
  }
}
