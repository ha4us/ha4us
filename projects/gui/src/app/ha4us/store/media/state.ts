import {
  createEntityAdapter,
  EntityAdapter,
  EntityState,
  Dictionary,
} from '@ngrx/entity'

import { MediaSearchEvent } from '../../models'

import { Ha4usMedia, IPager } from '@ha4us/core'

import { SafeHtml } from '@angular/platform-browser'
export interface MediaState extends EntityState<Ha4usMedia> {
  cache: Dictionary<SafeHtml>
}

export interface State {
  selectedUrn: string
  search: MediaSearchEvent
  media: MediaState
}

export const mediaAdapter: EntityAdapter<Ha4usMedia> = createEntityAdapter<
  Ha4usMedia
>({
  selectId: (media: Ha4usMedia) => media.urn,
  sortComparer: false,
})
