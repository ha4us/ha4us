import { Injectable } from '@angular/core'
import {
  EntityState,
  EntityStore,
  StoreConfig,
  ActiveState,
} from '@datorama/akita'
import { Visor, VisorEntity, VisorEntityType, VisorId } from '../models'
export interface VisorState
  extends EntityState<Visor, VisorId>,
    ActiveState<VisorId> {
  editMode: boolean
  current: VisorId
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'visor' })
export class VisorStore extends EntityStore<VisorState> {
  constructor() {
    super({ active: null })
  }

  setCurrent(current: VisorId) {
    this.update({ current })
  }
  setEditMode(editMode: boolean) {
    this.update({ editMode })
  }
}
