import { Injectable } from '@angular/core'

import { Observable, of } from 'rxjs'

import {
  mergeMap,
  catchError,
  debounceTime,
  map,
  distinctUntilChanged,
  tap,
  take,
  groupBy,
} from 'rxjs/operators'

import { Actions as FxActions, Effect, ofType } from '@ngrx/effects'

import * as Actions from './actions'

import { MediaService } from '../../services/media.service'
import { Ha4usApiService } from '../../services/ha4us-api.service'

@Injectable()
export class MediaEffects {
  @Effect()
  get = this.action$.pipe(
    ofType(Actions.Types.Get),
    mergeMap((action: Actions.Get) =>
      this.api.mediaQuery(action.payload).pipe(
        map(data => new Actions.Add(data)),
        catchError(error => of(new Actions.Failure(action, error)))
      )
    )
  )
  @Effect()
  upserting = this.action$.pipe(
    ofType<Actions.UpsertOne>(Actions.Types.UpsertOne),
    groupBy(action => action.payload.urn),
    mergeMap(singleUpdates =>
      singleUpdates.pipe(
        debounceTime(2000),
        mergeMap(action =>
          this.api.mediaPut(action.payload).pipe(
            map(result => new Actions.Success(action)),
            catchError(error => of(new Actions.Failure(action, error)))
          )
        )
      )
    )
  )

  @Effect()
  deleting = this.action$.pipe(
    ofType<Actions.RemoveOne>(Actions.Types.RemoveOne),
    mergeMap(action =>
      this.api.mediaDelete(MediaService.getId(action.payload)).pipe(
        map((result: string) => new Actions.Success(action)),
        catchError(error => of(new Actions.Failure(action, error)))
      )
    )
  )

  constructor(protected api: Ha4usApiService, private action$: FxActions) {}
}
