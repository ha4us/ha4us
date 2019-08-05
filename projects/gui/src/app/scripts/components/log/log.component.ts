import {
  Component,
  OnInit,
  Input,
  ViewChild,
  QueryList,
  ElementRef,
  ViewChildren,
} from '@angular/core'
import { debounceTime } from 'rxjs/operators'
import { CdkScrollable } from '@angular/cdk/overlay'

@Component({
  selector: 'ha4us-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss'],
})
export class LogComponent implements OnInit {
  autoscroll = true
  @Input() topic: string

  @ViewChild(CdkScrollable, /* TODO: add static flag */ {static:false}) logList: CdkScrollable

  iconMap = {
    warn: 'warning',
    error: 'error',
  }

  _logEntries: QueryList<ElementRef<HTMLDivElement>>
  @ViewChildren('logEntry',) set logEntries(
    ql: QueryList<ElementRef<HTMLDivElement>>
  ) {
    if (ql && !this._logEntries) {
      this._logEntries = ql

      this._logEntries.changes.pipe(debounceTime(100)).subscribe(event => {
        if (this._logEntries && this._logEntries.last && this.autoscroll) {
          this.logList.scrollTo({ bottom: 0, behavior: 'smooth' })
        }
      })
    }
  }

  constructor() {}

  ngOnInit() {
    this.logList
      .elementScrolled()
      .pipe(debounceTime(200))
      .subscribe(event => {
        this.autoscroll = this.logList.measureScrollOffset('bottom') === 0
      })
  }
}
