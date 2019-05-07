import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity'
import { EntitySelectors, Dictionary } from '@ngrx/entity/src/models'

import { MemoizedSelector } from '@ngrx/store'
import { PageEvent } from '@angular/material'
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

import { State, mediaAdapter } from './state'

import { Ha4usMedia } from '@ha4us/core'
import { getMedia } from '../store'


export const media = createSelector(getMedia, state => state.media)
export const selectedUrn = createSelector(
    getMedia,
    state => state.selectedUrn
)
export const selectMediaCache = createSelector(media, state => state.cache)

export const {
    selectIds: selectURNs,
    selectEntities: selectEntities,
    selectAll: selectAllMedia,
    selectTotal: selectMediaCount,
} = mediaAdapter.getSelectors(media)

export const getQuery = createSelector(getMedia, state => state.search)

export const selectedMedia = createSelector(
    selectedUrn,
    selectEntities,
    (urn, data) => data[urn]
)

export function selectOne(urn: string) {
    return createSelector(selectEntities, entities => entities[urn])
}
