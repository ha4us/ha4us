import { Injectable } from '@angular/core'
import {
  EntityState,
  EntityStore,
  StoreConfig,
  ActiveState,
} from '@datorama/akita'
import { Dashboard } from './dashboard.model'

export interface DashboardState extends EntityState<Dashboard>, ActiveState {
  ui: {
    editMode: boolean;
    test: string;
  }
}

const initialState = {
  ui: {
    editMode: false,
    test: 'HELLO WORLD',
  },
  active: null,
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'dashboard' })
export class DashboardStore extends EntityStore<DashboardState> {
  constructor() {
    super(initialState)
  }
}
