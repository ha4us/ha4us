import { Injectable } from '@angular/core'
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita'
import { Ha4usObject, Ha4usObjectSearch } from '@ha4us/core'

export interface ObjectsState extends EntityState<Ha4usObject, string> {
  search: Ha4usObjectSearch
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'objects', idKey: 'topic' })
export class ObjectsStore extends EntityStore<ObjectsState> {
  constructor() {
    super({ search: { pattern: '#' } })
  }
}
