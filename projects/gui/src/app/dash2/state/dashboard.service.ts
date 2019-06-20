import { Injectable } from '@angular/core'
import { ID, arrayAdd, arrayRemove } from '@datorama/akita'
import { HttpClient } from '@angular/common/http'
import { uuid, randomString } from '@ha4us/core'
import { DashboardStore } from './dashboard.store'
import { Dashboard, createDashboard, DashboardCard } from './dashboard.model'
import { tap } from 'rxjs/operators'
import { DashboardQuery } from './dashboard.query'
import Debug from 'debug'
const debug = Debug('ha4us:gui:dash2:service')
@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(
    private store: DashboardStore,
    protected query: DashboardQuery,
    private http: HttpClient
  ) {}

  setEditMode(editMode: boolean) {
    this.store.update(state => ({ ui: { ...state.ui, editMode } }))
  }

  setActive(id: ID) {
    this.store.setActive(id)
  }

  get() {
    /* return this.http.get('https://api.com').pipe(tap(entities => {
      this.dashboardStore.set(entities)
    }));*/
  }

  set(dashboards: Dashboard[]) {
    this.store.set(dashboards)
  }

  create(dash: Partial<Dashboard> = {}) {
    this.store.add(createDashboard({ id: uuid(), label: randomString(5, 36) }))
  }

  move(id: ID, delta: number) {
    const cards = this.query.getAll()

    const from = cards.findIndex(card => card.id === id)
    const to = from + delta

    if (to > -1 && to < cards.length) {
      const removedElement = cards.splice(from, 1)[0]
      cards.splice(to, 0, removedElement)
    }

    this.store.set(cards)
  }

  add(dashboard: Dashboard) {
    this.store.add(dashboard)
  }

  update(id, dashboard: Partial<Dashboard>) {
    debug('Updating', id, dashboard)
    this.store.update(id, dashboard)
  }

  remove(id: ID) {
    this.store.remove(id)
  }

  addCard(card: DashboardCard, id?: ID) {
    id = id || this.query.getActiveId()

    this.store.update(id, dashboard => ({
      cards: arrayAdd(dashboard.cards, card),
    }))
  }

  deleteCard(cardId: string, id?: ID) {
    id = id || this.query.getActiveId()

    this.store.update(id, dashboard => ({
      cards: arrayRemove(dashboard.cards, cardId),
    }))
  }
}
