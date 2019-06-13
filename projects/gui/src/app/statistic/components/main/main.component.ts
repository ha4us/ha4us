import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { StatisticQuery, AggUnit } from '@app/statistic/statistic.service'

@Component({
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class MainComponent implements OnInit {
  query: StatisticQuery = {
    topic: 'hm/Aussenklima/TEMPERATURE',
    to: undefined,
    duration: 'P3M',
    aggregateBy: AggUnit.None,
  }
  constructor() {}

  ngOnInit() {}
}
