import {
  createEntityAdapter,
  EntityAdapter,
  EntityState,
  Update,
} from '@ngrx/entity'
import { EntitySelectors, Dictionary } from '@ngrx/entity/src/models'

import { MemoizedSelector } from '@ngrx/store'
import { PageEvent } from '@angular/material'
import { Ha4usAction as Action, createSimpleReducer } from '@ha4us/ng'

import {
  createSelector,
  createFeatureSelector,
  ActionReducer,
  ActionReducerMap,
  State as NGXState,
  combineReducers,
  compose,
} from '@ngrx/store'

import { Visor, VisorEntity, VisorEntityType, VisorId } from '../models'
import { Types, Actions, AddComponentPayload } from './visor.actions'

export interface VisorState extends EntityState<VisorEntity> {}

export const adapter: EntityAdapter<VisorEntity> = createEntityAdapter<
  VisorEntity
>({
  selectId: (component: VisorEntity) => component.id,
})

export interface State {
  selected: VisorId
  editMode: boolean
  current: VisorId
  components: VisorState
}

export function componentsReducer(
  state = adapter.getInitialState(),
  action: Actions.Union
): VisorState {
  let parent: Visor
  switch (action.type) {
    case Types.Loaded:
      const data = action.payload
      if (data) {
        const newstate = adapter.addAll(data, state)
        return newstate
      } else {
        return state
      }

    case Types.AddChild:
      parent = state.entities[action.id] as Visor
      if (
        parent.type === VisorEntityType.Visor &&
        parent.children.indexOf(action.child)
      ) {
        const children = [...parent.children, action.child]

        return adapter.updateOne(
          {
            id: parent.id,
            changes: { children },
          } as Update<Visor>,
          state
        )
      }
      return state
    case Types.RemoveChild:
      parent = state.entities[action.id] as Visor

      if (parent.type === VisorEntityType.Visor) {
        const children = parent.children.filter(
          compId => compId !== action.child
        )

        return adapter.updateOne(
          {
            id: parent.id,
            changes: { children },
          } as Update<Visor>,
          state
        )
      }
      return state
    case Types.UpdateComponent:
      return adapter.updateOne(action, state)
    case Types.AddComponent:
      return adapter.addOne(action.payload, state)
    case Types.AddComponents:
      return adapter.addMany(action.payload, state)
    case Types.RemoveComponent:
      return adapter.removeOne(action.id, state)
    default:
      return state
  }
}

export const visorReducer: ActionReducer<State> = combineReducers({
  selected: createSimpleReducer(Types.SetSelected, undefined),
  editMode: createSimpleReducer(Types.SetEditMode, false),
  current: createSimpleReducer(Types.SetMain, undefined),
  components: componentsReducer,
})

export function reducer(state: State, action: Actions.Union) {
  return visorReducer(state, action)
}
