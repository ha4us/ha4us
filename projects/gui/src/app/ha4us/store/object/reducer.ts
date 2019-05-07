import { createSelector, combineReducers } from '@ngrx/store'

import { Ha4usObject, Ha4usObjectSearch } from '@ha4us/core'
import * as Actions from './actions'
import { Types } from './actions'
import { Dictionary, EntitySelectors } from '@ngrx/entity/src/models'

import { objectAdapter, ObjectState, SearchState, State } from './state'

export const initialState: ObjectState = objectAdapter.getInitialState()

export function objectReducer(
  state = initialState,
  action: Actions.Union
): ObjectState {
  switch (action.type) {
    case Types.SyncAddMany: {
      /**
       * The addMany function provided by the created adapter
       * adds many records to the entity dictionary
       * and returns a new state including those records. If
       * the collection is to be sorted, the adapter will
       * sort each record upon entry into the sorted array.
       */

      if (Array.isArray(action.payload)) {
        const data: Ha4usObject[] = action.payload
        return objectAdapter.addMany(data, {
          ...state,
        })
      } else {
        return objectAdapter.addOne(action.payload, {
          ...state,
        })
      }
    }

    case Types.RemoveOne:
    case Types.SyncRemoveOne: {
      return objectAdapter.removeOne(action.payload, {
        ...state,
      })
    }

    case Types.UpsertOne:
    case Types.SyncUpsertOne: {
      return objectAdapter.upsertOne(action.payload, {
        ...state,
      })
    }

    case Types.UpdateOne: {
      return objectAdapter.updateOne(action.payload, {
        ...state,
      })
    }

    default: {
      return state
    }
  }
}

export function searchReducer(
  state = { pattern: '#', tags: [] },
  action: Actions.Search
): SearchState {
  switch (action.type) {
    case Types.Search:
      const search: Ha4usObjectSearch =
        typeof action.payload === 'string'
          ? { pattern: action.payload }
          : (action.payload as Ha4usObjectSearch)
      return search

    default:
      return state
  }
}

export const mainReducer = combineReducers({
  object: objectReducer,
  search: searchReducer,
})

export function reducer(state: State, action: Actions.Union) {
  return mainReducer(state, action)
}
