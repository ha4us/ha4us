import { Component, OnInit, Input } from '@angular/core'
import {
  StatisticQuery,
  StatisticService,
} from '@app/statistic/statistic.service'
import { from, Observable } from 'rxjs'
import { mergeMap } from 'rxjs/operators'

@Component({
  selector: 'ha4us-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss'],
})
export class HistoryListComponent implements OnInit {
  data: Observable<any>
  @Input() set query(query: StatisticQuery) {
    this.renderChart(query)
  }
  constructor(protected stats: StatisticService) {}

  ngOnInit() {}

  renderChart(query: StatisticQuery) {
    if (query && query.topic) {
      const range = this.stats.createDateRange(query.duration, query.to)

      from(
        this.stats.aggregate(
          query.topic,
          query.aggregateBy,
          range.from,
          range.to
        )
      ).subscribe(data => (this.data = data))

      // this.stats.inventory().then(data => console.log ('Inv', data))

      // this.formatTime = this.stats.getFormatFunction(chart.aggregateBy)
    }
  }
}
