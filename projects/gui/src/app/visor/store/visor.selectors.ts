import {
  createSelector,
  createFeatureSelector,
  ActionReducer,
  ActionReducerMap,
  State as NGXState,
  combineReducers,
  compose,
} from '@ngrx/store'

import { VisorEntityType, Visor, VisorId } from '../models'

import { State, adapter } from './visor.reducer'

export const visor = createFeatureSelector<State>('visor')

export const getSelected = createSelector(
  visor,
  state => state.selected
)

export const getEditMode = createSelector(
  visor,
  state => state.editMode
)

export const components = createSelector(
  visor,
  state => state.components
)

export const {
  selectIds: getComponentIds,
  selectEntities: getEntities,
  selectAll: getAllComponents,
  selectTotal: getComponentCount,
} = adapter.getSelectors(components)

export const getMainContainer = createSelector(
  visor,
  state => state.current
)

export const getSelectedEntity = createSelector(
  getSelected,
  getEntities,
  (selected, entities) => entities[selected]
)

export function selectById(id: VisorId) {
  return createSelector(
    getEntities,
    entities => entities[id]
  )
}

export const visorConfiguration = createSelector(
  getMainContainer,
  getAllComponents,
  (main, entities) => ({
    main,
    entities,
  })
)

export const getVisors = createSelector(
  getAllComponents,
  allComponents =>
    allComponents.filter(
      (comp: Visor) => comp.type === VisorEntityType.Visor
    ) as Visor[]
)
