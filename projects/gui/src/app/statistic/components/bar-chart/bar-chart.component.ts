import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core'
import { Observable, from } from 'rxjs'

import { StatisticService, StatisticQuery } from '../../statistic.service'
import { map } from 'rxjs/operators'

@Component({
  selector: 'ha4us-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent implements OnInit {
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
      ).pipe(map(series => [{ name: chart.topic, series }]))
      this.formatTime = this.stats.getFormatFunction(chart.aggregateBy)
    }
  }

  formatValue(data: number) {
    return data
  }
}
