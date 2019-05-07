import { Injectable } from '@angular/core'
import { coerceBooleanProperty } from '@angular/cdk/coercion'
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router'
import { Observable, of } from 'rxjs'

import { mergeMap, map, switchMap, catchError } from 'rxjs/operators'

import { VisorService } from '../services/visor.service'
import { Visor, VisorEntity, VisorEntityType } from '../models'

const debug = require('debug')('ha4us:gui:visor:guard')

function isVisor(entity: VisorEntity): entity is Visor {
  return entity.type === VisorEntityType.Visor
}

@Injectable({
  providedIn: 'root',
})
export class VisorGuard implements CanActivate {
  constructor(protected vs: VisorService) {}

  // wrapping the logic so we can .switchMap() it
  getFromStoreOrAPI(): Observable<VisorEntity[]> {
    // return an Observable stream from the store
    return this.vs.visors$.pipe(
      switchMap(visors => {
        debug('Entities arrived', visors)
        if (visors && visors.length > 0) {
          return of(visors)
        } else {
          return this.vs.loadAll().pipe(
            map(loadedVisors => {
              if (loadedVisors.length === 0) {
                debug('Creating default visor')
                loadedVisors = [this.vs.create('Standard')]
                this.vs.addComponent(loadedVisors[0])
              } else {
                this.vs.sync(loadedVisors)
              }

              return loadedVisors
            })
          )
        }
      }),
      map(visors => {
        debug(`${visors.length} visor(s) available`)
        return visors
      })
    )
  }

  checkEdit(next: ActivatedRouteSnapshot): Observable<boolean> {
    const edit = coerceBooleanProperty(next.queryParamMap.get('edit'))
    this.vs.setEditMode(edit)
    return of(true)
  }

  setMain(
    entities: VisorEntity[],
    next: ActivatedRouteSnapshot
  ): Observable<boolean> {
    const visors = entities.filter(isVisor)
    debug('Visors', visors)
    const label = next.params && next.paramMap.get('label')
    const mainVisor = label
      ? visors.find(visor => visor.label === label || visor.id === label)
      : visors[0]
    debug(`Found ${mainVisor.id} in route`)
    this.vs.setMain(mainVisor.id)
    return of(true)
  }

  // our guard that gets called each time we
  // navigate to a new route
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    debug('checking loaded visors....')
    // return our Observable stream from above
    return this.getFromStoreOrAPI().pipe(
      mergeMap(visors => this.setMain(visors, next)),
      mergeMap(() => this.checkEdit(next)),
      // otherwise, something went wrong
      catchError(e => {
        debug('Error in route guard', e)
        return of(false)
      })
    )
  }
}
