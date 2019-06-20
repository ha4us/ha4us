import { Injectable } from '@angular/core'
import { QueryEntity } from '@datorama/akita'
import { DashboardStore, DashboardState } from './dashboard.store'

@Injectable({ providedIn: 'root' })
export class DashboardQuery extends QueryEntity<DashboardState> {
  ui$ = this.select(state => state.ui)

  dashboard$ = this.selectAll()

  activeCards$ = this.selectActive(active => active.cards || [])

  activeDashboard$ = this.selectActive()

  constructor(protected store: DashboardStore) {
    super(store)
  }
}
