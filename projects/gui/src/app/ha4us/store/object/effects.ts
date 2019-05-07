import { Injectable } from '@angular/core'
import { Actions as FxActions, Effect, ofType } from '@ngrx/effects'
import { select, Store } from '@ngrx/store'
import { Ha4usObjectEvent } from 'ha4us/core'
import { of } from 'rxjs'
import {
  catchError,
  filter,
  map,
  mergeMap,
  switchMap,
  take,
} from 'rxjs/operators'
import { StatesService } from '../../services/state.service'
import { Ha4usApiService } from '../../services/ha4us-api.service'
import * as Actions from './actions'
import { Types } from './actions'
import { selectOne } from './selector'
import { State } from './state'

@Injectable()
export class ObjectEffects {
  @Effect()
  syncing = this.action$.pipe(
    ofType(Types.TriggerSync),
    switchMap((action: Actions.TriggerSync) =>
      this.api.objectGet(action.payload).pipe(
        map(data => {
          return new Actions.SyncAddMany(data)
        }),
        catchError(e => of(new Actions.Failure(action, e)))
      )
    )
  )

  @Effect()
  deleting = this.action$.pipe(
    ofType(Types.RemoveOne),
    mergeMap((action: Actions.RemoveOne) =>
      this.api.objectDelete(action.payload).pipe(
        map(() => new Actions.Success(action)),
        catchError(err => of(new Actions.Failure(action, err)))
      )
    )
  )
  @Effect()
  update = this.action$.pipe(
    ofType(Types.UpdateOne),
    mergeMap((action: Actions.UpdateOne) =>
      this.store.pipe(select(selectOne(action.payload.id as string))).pipe(
        take(1),
        mergeMap(obj => this.api.objectPut(obj)),
        map(() => new Actions.Success(action)),
        catchError(err => of(new Actions.Failure(action, err)))
      )
    )
  )

  @Effect()
  upsert = this.action$.pipe(
    ofType(Types.UpsertOne),
    mergeMap((action: Actions.UpsertOne) =>
      this.api.objectPut(action.payload).pipe(
        take(1),
        catchError(err => this.api.objectPost(action.payload)),
        map(() => new Actions.Success(action)),
        catchError(err => of(new Actions.Failure(action, err)))
      )
    )
  )

  @Effect()
  sync = this.state.observe('/+/object/#', '/+/object').pipe(
    filter(ev => ev.val && ev.val.sender && ev.val.sender !== 'rest'),
    map(ev => ev.val as Ha4usObjectEvent),
    map(ev =>
      ev.action === 'delete'
        ? new Actions.SyncRemoveOne(ev.object.topic)
        : new Actions.SyncUpsertOne(ev.object)
    )
  )

  constructor(
    protected api: Ha4usApiService,
    protected store: Store<State>,
    private action$: FxActions,
    protected state: StatesService
  ) {}
}
