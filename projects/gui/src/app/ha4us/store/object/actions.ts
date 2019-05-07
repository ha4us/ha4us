import {
  Ha4usAction as Action,
  Ha4usFailureAction,
  Ha4usSuccessAction,
} from '../common'
import { Update } from '@ngrx/entity'
import {
  Ha4usObject,
  Ha4usObjectEvent,
  Ha4usError,
  Ha4usObjectQuery,
} from 'ha4us/core'

// import { Search as SearchModel } from './models'
import { Ha4usRoleDefinition } from '../../models'
export enum Types {
  Search = '[Object] Search', // updates search state

  Failure = '[Object] Action Failed', // does currently nothing
  Success = '[Object] Action Succeeded', // does currently nothin

  TriggerSync = '[Object] TriggerSync', // triggers getting objects from api via effects
  SyncAddMany = '[Object] SyncAddMany', // replaces in store, triggered by preload guard
  SyncUpsertOne = '[Object] SyncUpsertOne', // upserts in store triggered by sync
  SyncRemoveOne = '[Object] SyncRemoveOne', // remove from store triggered by synx

  // changes store, triggers api effect
  UpsertOne = '[Object] UpsertOne',
  UpdateOne = '[Object] UpdateOne',
  RemoveOne = '[Object] RemoveOne',
}

export class TriggerSync extends Action<Ha4usObjectQuery> {
  readonly type = Types.TriggerSync
}

export class Search extends Action<Ha4usObjectQuery> {
  readonly type = Types.Search
}

export class Failure implements Ha4usFailureAction {
  readonly type = Types.Failure

  constructor(public action: any, public error: Ha4usError) {}
}
export class Success implements Ha4usSuccessAction {
  readonly type = Types.Success

  constructor(public action: any) {}
}

export class UpsertOne extends Action<Ha4usObject> {
  readonly type = Types.UpsertOne
}

export class UpdateOne extends Action<Update<Ha4usObject>> {
  readonly type = Types.UpdateOne
}

export class RemoveOne extends Action<string> {
  readonly type = Types.RemoveOne
}

export class SyncAddMany extends Action<Ha4usObject | Ha4usObject[]> {
  readonly type = Types.SyncAddMany
}

export class SyncUpsertOne extends Action<Ha4usObject> {
  readonly type = Types.SyncUpsertOne
}

export class SyncRemoveOne extends Action<string> {
  readonly type = Types.SyncRemoveOne
}

export type Union =
  | TriggerSync
  | Search
  | Failure
  | Success
  | UpsertOne
  | UpdateOne
  | RemoveOne
  | SyncAddMany
  | SyncUpsertOne
  | SyncRemoveOne
