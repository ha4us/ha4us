import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  SimpleChanges,
  OnChanges,
} from '@angular/core'
import { Observable, from } from 'rxjs'
import {
  StatisticService,
  AggUnit,
  StatisticQuery,
} from '@app/statistic/statistic.service'
import { map } from 'rxjs/operators'
import * as moment from 'moment'
@Component({
  selector: 'ha4us-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent implements OnInit {
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
      this.chartData$ = from(
        this.stats.aggregate(
          chart.topic,
          chart.aggregateBy,
          range.from,
          range.to
        )
      ).pipe(map(series => [{ name: 'Test', series }]))
      this.formatTime = this.stats.getFormatFunction(chart.aggregateBy)
    }
  }

  formatValue(data: number) {
    return data
  }
}
