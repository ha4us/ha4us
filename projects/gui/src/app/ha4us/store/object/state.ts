import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity'
import { Ha4usObject, Ha4usObjectSearch } from 'ha4us/core'

export interface ObjectState extends EntityState<Ha4usObject> {}

export type SearchState = Ha4usObjectSearch
export const objectAdapter: EntityAdapter<Ha4usObject> = createEntityAdapter<
  Ha4usObject
>({
  selectId: (object: Ha4usObject) => object.topic,
  sortComparer: false,
})

export interface State {
  object: ObjectState
  search: SearchState
}
