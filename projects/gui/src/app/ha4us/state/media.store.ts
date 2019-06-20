import { Injectable } from '@angular/core'
import {
  EntityState,
  EntityStore,
  StoreConfig,
  HashMap,
  ActiveState,
} from '@datorama/akita'
import { Ha4usMedia } from '@ha4us/core'
import { MediaSearchEvent } from '../models'
import { SafeHtml } from '@angular/platform-browser'

export interface MediaState
  extends EntityState<Ha4usMedia, string>,
    ActiveState {
  search: MediaSearchEvent
  cache: HashMap<SafeHtml>
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'media', idKey: 'urn' })
export class MediaStore extends EntityStore<MediaState> {
  constructor() {
    super({
      cache: {},
      active: null,
      search: { mimeType: '*', fileName: undefined, tags: [] },
    })
  }
}
