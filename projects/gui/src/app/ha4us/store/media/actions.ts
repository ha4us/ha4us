import {
  Ha4usAction as Action,
  Ha4usSuccessAction,
  Ha4usFailureAction,
} from '../common'
import { Ha4usError } from '@ha4us/core'
import { Ha4usMedia, Ha4usMediaDefinition } from '@ha4us/core'
import { MediaSearchEvent } from '../../models'
import { SafeHtml } from '@angular/platform-browser'
export enum Types {
  Get = '[Media] Get',
  Put = '[Media] Put',
  Delete = '[Media] Delete',

  Search = '[Media] Search',
  Select = '[Media] Select',
  Upload = '[Media] Upload',

  RemoveOne = '[Media] RemoveOne',
  Add = '[Media] Add',
  UpsertOne = '[Media] UpsertOne',
  CacheMedia = '[Media] Cache',

  Failure = '[Media] Action Failed',
  Success = '[Media] Action Succeeded',
}

export class Failure implements Ha4usFailureAction {
  readonly type = Types.Failure

  constructor(public action: any, public error: Ha4usError) {}
}
export class Success implements Ha4usSuccessAction {
  readonly type = Types.Success

  constructor(public action: any) {}
}

export class Get implements Action<Partial<MediaSearchEvent>> {
  readonly type = Types.Get
  constructor(public payload: Partial<MediaSearchEvent>) {}
}

export class Upload
  implements Action<{ blob: Blob; data: Partial<Ha4usMediaDefinition> }> {
  readonly type = Types.Upload

  payload: { blob: Blob; data: Partial<Ha4usMediaDefinition> }

  constructor(blob: Blob, data: Partial<Ha4usMediaDefinition>) {
    this.payload = { blob, data }
  }
}

export class Put implements Action<Partial<Ha4usMedia>> {
  readonly type = Types.Put
  constructor(public payload: Partial<Ha4usMedia>) {}
}

export class Delete implements Action<string> {
  readonly type = Types.Delete

  constructor(public payload: string) {}
}

export class Search implements Action<MediaSearchEvent> {
  readonly type = Types.Search
  constructor(public payload: MediaSearchEvent) {}
}

export class Select implements Action<string> {
  readonly type = Types.Select
  constructor(public payload: string) {}
}

export class UpsertOne implements Action<Ha4usMedia> {
  readonly type = Types.UpsertOne
  constructor(public payload: Ha4usMedia) {}
}

export class Cache implements Action<{ urn: string; content: SafeHtml }> {
  readonly type = Types.CacheMedia
  readonly payload: { urn: string; content: SafeHtml }
  constructor(urn: string, content: SafeHtml) {
    this.payload = { urn, content }
  }
}

export class Add implements Action<Ha4usMedia | Ha4usMedia[]> {
  readonly type = Types.Add
  constructor(public payload: Ha4usMedia | Ha4usMedia[]) {}
}

export class RemoveOne implements Action<string> {
  readonly type = Types.RemoveOne

  constructor(public payload: string) {}
}

export type Union =
  | Failure
  | Success
  | Get
  | Upload
  | Put
  | Delete
  | Search
  | Select
  | UpsertOne
  | Add
  | RemoveOne
  | Cache
