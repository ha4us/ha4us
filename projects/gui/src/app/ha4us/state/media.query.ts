import { Injectable } from '@angular/core'
import { QueryEntity } from '@datorama/akita'
import { MediaStore, MediaState } from './media.store'

@Injectable({ providedIn: 'root' })
export class MediaQuery extends QueryEntity<MediaState> {
  constructor(protected store: MediaStore) {
    super(store)
  }
}
