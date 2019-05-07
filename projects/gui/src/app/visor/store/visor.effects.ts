import { Injectable } from '@angular/core'

import { Observable, of, from } from 'rxjs'

import {
  mergeMap,
  catchError,
  debounceTime,
  map,
  switchMap,
  distinctUntilChanged,
  withLatestFrom,
  tap,
  groupBy,
} from 'rxjs/operators'

import { Actions as FxActions, Effect, ofType } from '@ngrx/effects'

import { Types, Actions, Action } from './visor.actions'

import { Visor, VisorObject } from '../models'

import { VisorService } from '../services/visor.service'
import { ObjectService } from '@ha4us/ng'

const debug = require('debug')('ha4us:gui:visor:store:effects')

@Injectable()
export class VisorEffects {
  @Effect()
  added = this.action$.pipe(
    ofType(Types.AddComponent),
    map((action: Actions.AddComponent) => this.vs.post(action.payload)),
    map(() => new Actions.Saved())
  )

  @Effect()
  saving = this.action$.pipe(
    ofType(Types.UpdateComponent, Types.AddChild, Types.RemoveChild),
    groupBy((action: Action) => action.id),
    mergeMap(idUpdateStream =>
      idUpdateStream.pipe(
        debounceTime(5000),
        switchMap(action => {
          debug(`Performing ${action.type} for ${action.id}`)
          return this.vs.put(action.id).pipe(
            map(() => new Actions.Saved()),
            catchError(data => of(new Actions.SaveFailed('Fehler!!!')))
          )
          return Promise.resolve(new Actions.Saved())
        })
      )
    )
  )
  @Effect()
  removed = this.action$.pipe(
    ofType(Types.RemoveComponent),
    map((action: Actions.RemoveComponent) => this.vs.delete(action.id)),
    map(() => new Actions.Saved())
  )

  @Effect()
  removeReferences = this.action$.pipe(
    ofType(Types.RemoveComponent),
    withLatestFrom(this.vs.visors$),
    switchMap(([action, visors]: [Actions.RemoveComponent, Visor[]]) => {
      return visors
        .filter(visor => visor.children.indexOf(action.id) > -1)
        .map(visor => new Actions.RemoveChild(visor.id, action.id))
    })
  )

  @Effect()
  removeOrphans = this.action$.pipe(
    ofType(Types.RemoveChild),
    withLatestFrom(this.vs.visors$),
    map(([action, visors]: [Actions.RemoveChild, Visor[]]) => {
      debug('Checking orphans', action.child)
      const orphan = visors.reduce((res, cur) => {
        return res && cur.children.indexOf(action.child) < 0
      }, true)
      if (orphan) {
        debug('Removing orphan', action.child)
        return new Actions.RemoveComponent(action.child)
      } else {
        return new Actions.Saved()
      }
    })
  )

  @Effect()
  loading = this.action$.pipe(
    ofType(Types.Load),
    switchMap(() =>
      this.vs.loadAll().pipe(
        map(data => {
          if (data.length === 0) {
            const visor = new Visor('Standard')
            debug(`created first Visor ${visor.id}`)
            return new Actions.AddComponent(visor)
          } else {
            return new Actions.Loaded(data)
          }
        }),
        catchError(e => of(new Actions.LoadFailed(e.message)))
      )
    )
  )

  constructor(
    private action$: FxActions,
    protected vs: VisorService,
    protected os: ObjectService
  ) {}
}
