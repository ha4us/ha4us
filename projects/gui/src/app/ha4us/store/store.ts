import {
  Action,
  createSelector,
  createFeatureSelector,
  ActionReducer,
  ActionReducerMap,
  State as NGXState,
  combineReducers,
  compose,
} from '@ngrx/store'

import { reducer as MediaReducer } from './media/reducer'
import { reducer as ObjectReducer } from './object/reducer'
import { State as MediaState } from './media/state'
import { State as ObjectState } from './object/state'
export interface State {
  media: MediaState
  object: ObjectState
}
export const ha4usReducer: ActionReducer<State> = combineReducers({
  media: MediaReducer,
  object: ObjectReducer,
})

export function reducer(state: State, action: Action) {
  return ha4usReducer(state, action)
}
export const getStore = createFeatureSelector<State>('ha4us')
export const getObjects = createSelector(
  getStore,
  state => state.object
)
export const getMedia = createSelector(
  getStore,
  state => state.media
)
