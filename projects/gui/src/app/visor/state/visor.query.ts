import { Injectable } from '@angular/core'
import { QueryEntity } from '@datorama/akita'
import { VisorStore, VisorState } from './visor.store'

@Injectable({ providedIn: 'root' })
export class VisorQuery extends QueryEntity<VisorState> {
  constructor(protected store: VisorStore) {
    super(store)
  }
}
