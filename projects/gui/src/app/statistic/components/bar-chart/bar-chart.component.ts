import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core'
import { Observable, from } from 'rxjs'

import { StatisticService } from '../../statistic.service'
import { map } from 'rxjs/operators'

@Component({
  selector: 'ha4us-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent implements OnInit {
  @Input() topic: string
  chartData$: Observable<any[]>
  constructor(protected stats: StatisticService) {}

  ngOnInit() {
    this.chartData$ = from(this.stats.aggregateBar(this.topic, 'week')).pipe(
      map(data => [data])
    )
  }
}
