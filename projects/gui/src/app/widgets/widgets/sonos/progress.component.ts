import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core'
import { interval, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
@Component({
  selector: 'ha4us-progress',
  template: `<mat-progress-bar mode="determinate" [value]="progress | async"></mat-progress-bar>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressComponent implements OnInit {


  progress = interval(1000)
  @Input() duration: number
  @Input() set elapsed(elapsed: number) {
    console.log('Setting new ', elapsed)
    this.progress = interval(500).pipe(
      map(i => {
        return ((elapsed + (i / 2)) / this.duration) * 100
      })
    )
  }

  constructor() { }

  ngOnInit() {
  }

}
