import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity'
import { EntitySelectors, Dictionary } from '@ngrx/entity/src/models'

import { MemoizedSelector } from '@ngrx/store'

import { Ha4usAction as Action, createSimpleReducer } from '../common'
import { MediaSearchEvent } from '../../models'
import {
  createSelector,
  createFeatureSelector,
  ActionReducer,
  ActionReducerMap,
  State as NGXState,
  combineReducers,
  compose,
} from '@ngrx/store'

import { mediaAdapter, State, MediaState } from './state'

import { Ha4usMedia, IPager } from 'ha4us/core'
import * as Actions from './actions'
import { Types } from './actions'

export function searchReducer(
  state: MediaSearchEvent,
  action: Actions.Union
): MediaSearchEvent {
  switch (action.type) {
    case Types.Search:
      return action.payload
    default:
      return state
  }
}

export function mediaReducer(
  state = mediaAdapter.getInitialState({ cache: {} }),
  action: Actions.Union
): MediaState {
  switch (action.type) {
    case Types.Add:
      if (Array.isArray(action.payload)) {
        const data: Ha4usMedia[] = action.payload
        return mediaAdapter.addMany(data, {
          ...state,
        })
      } else {
        return mediaAdapter.addOne(action.payload, {
          ...state,
        })
      }

    case Types.RemoveOne:
      return mediaAdapter.removeOne(action.payload, state)

    case Types.UpsertOne:
      return mediaAdapter.upsertOne(action.payload, { ...state })

    case Types.CacheMedia:
      const payload = (action as Actions.Cache).payload
      const newCache = { ...state.cache }
      newCache[payload.urn] = payload.content
      return {
        ...state,
        cache: newCache,
      }

    default:
      return state
  }
}

export const reducer: ActionReducer<State> = combineReducers({
  search: searchReducer,
  selectedUrn: createSimpleReducer(Types.Select, ''),
  media: mediaReducer,
})

export function reducerFactory(state: State, action: Action) {
  return reducer(state, action)
}
