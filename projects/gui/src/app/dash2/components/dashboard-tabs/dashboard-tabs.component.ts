import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { DashboardService } from '@app/dash2/state/dashboard.service'
import { DashboardQuery } from '@app/dash2/state/dashboard.query'
import { ID } from '@datorama/akita'
import { MatTabChangeEvent } from '@angular/material'

import Debug from 'debug'
import { withLatestFrom, map } from 'rxjs/operators'
const debug = Debug('ha4us:gui:dash2:tabs')

@Component({
  selector: 'ha4us-dashboard-tabs',
  templateUrl: './dashboard-tabs.component.html',
  styleUrls: ['./dashboard-tabs.component.scss'],
})
export class DashboardTabsComponent implements OnInit {
  dashboard$ = this.query.dashboard$

  activeDashboardIdx$ = this.query.selectActiveId().pipe(
    map(id => {
      const dashboards = this.query.getAll()
      return dashboards.findIndex(dashboard => dashboard.id === id)
    })
  )

  editMode$ = this.query.select(state => state.ui.editMode)

  @Output() add = new EventEmitter<void>()
  @Output() move = new EventEmitter<{ idx: number; delta: number }>()
  @Output() edit = new EventEmitter<string>()

  constructor(
    protected service: DashboardService,
    protected query: DashboardQuery
  ) {}

  ngOnInit() {}

  tabChanged($event: MatTabChangeEvent) {
    debug('Setting active to', $event.tab.textLabel)
    this.service.setActive($event.tab.textLabel)
  }
}
