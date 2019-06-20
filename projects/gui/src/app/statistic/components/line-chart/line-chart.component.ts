import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  SimpleChanges,
  OnChanges,
} from '@angular/core'
import { Observable, from, NEVER, of } from 'rxjs'
import {
  StatisticService,
  AggUnit,
  StatisticQuery,
} from '@app/statistic/statistic.service'
import { map, catchError, retryWhen, tap, switchMap } from 'rxjs/operators'
import * as moment from 'moment'
@Component({
  selector: 'ha4us-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent implements OnInit {
  @Input() autoScale = false
  @Input() set chart(chart: StatisticQuery) {
    this.renderChart(chart)
  }

  chartData$: Observable<any[]>

  formatTime: (data: Date) => string
  constructor(protected stats: StatisticService) {}

  ngOnInit() {}

  renderChart(chart: StatisticQuery) {
    if (chart && chart.topic) {
      const range = this.stats.createDateRange(chart.duration, chart.to)
      this.chartData$ = of({
        topic: chart.topic,
        aggregateBy: chart.aggregateBy,
        from: range.from,
        to: range.to,
      }).pipe(
        switchMap(query =>
          this.stats.aggregate(
            query.topic,
            query.aggregateBy,
            query.from,
            query.to
          )
        ),
        map(series => [{ name: chart.topic, series }]),
        retryWhen(errors => errors.pipe(tap(() => console.error)))
      )

      this.formatTime = this.stats.getFormatFunction(chart.aggregateBy)
    }
  }

  formatValue(data: number) {
    return data
  }
}
