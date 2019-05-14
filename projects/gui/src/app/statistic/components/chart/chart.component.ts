import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core'
import * as shape from 'd3-shape'

import { StatisticService } from '../../statistic.service'

@Component({
  selector: 'ha4us-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ChartComponent implements OnInit {
  @Input() topic: string
  chartData: any[]

  // options
  showXAxis = true
  showYAxis = true
  gradient = false

  showLegend = true

  showXAxisLabel = true
  xAxisLabel = 'Country'
  showYAxisLabel = true
  yAxisLabel = 'Population'

  /*colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
  }*/

  // line, area
  autoScale = true

  constructor(protected stats: StatisticService) {}

  ngOnInit() {
    /*this.stats.inventory('hm/#').then(data => {
      console.log('Data', data)
    })*/
    /*this.stats.aggregate(this.topic, 'day').then(data => {
      console.log('Aggregation', data)
      this.chartData = [data]
    })*/
  }
}
