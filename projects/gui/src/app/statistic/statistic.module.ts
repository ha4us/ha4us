import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatDatepickerModule, MatSelectModule } from '@angular/material'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatMomentDateModule } from '@angular/material-moment-adapter'
import { MainModule } from '@app/main'

import { NgxChartsModule } from '@swimlane/ngx-charts'

import { StatisticRoutingModule } from './statistic-routing.module'
import { MainComponent } from './components/main/main.component'
import { QueryStatisticComponent } from './components/query-statistic/query-statistic.component'
import { ChartComponent } from './components/chart/chart.component'
import { BarChartComponent } from './components/bar-chart/bar-chart.component'
import { LineChartComponent } from './components/line-chart/line-chart.component'
import { BarVerticalTimeComponent } from './components/bar-vertical-time/bar-vertical-time.component'
import { HistoryListComponent } from './components/history-list/history-list.component'
import { HistoryInventoryComponent } from './components/history-inventory/history-inventory.component'

@NgModule({
  declarations: [
    MainComponent,
    QueryStatisticComponent,
    ChartComponent,
    BarChartComponent,
    LineChartComponent,
    BarVerticalTimeComponent,
    HistoryListComponent,
    HistoryInventoryComponent,
  ],
  imports: [
    CommonModule,
    MainModule,
    MatMomentDateModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatSelectModule,
    NgxChartsModule,
    StatisticRoutingModule,
  ],
})
export class StatisticModule {}
