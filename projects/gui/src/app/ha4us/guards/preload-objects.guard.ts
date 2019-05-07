import { Injectable } from '@angular/core'
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router'
import { Observable, of } from 'rxjs'

import { map, tap, filter, take, switchMap, catchError } from 'rxjs/operators'

import { Store, select } from '@ngrx/store'
import * as Actions from '../store/object/actions'

import { ObjectService } from '../services/object.service'

@Injectable({
  providedIn: 'root',
})
export class PreloadObjectsGuard implements CanActivate {
  // wrapping the logic so we can .switchMap() it#

  getFromStoreOrAPI(): Observable<any> {
    // return an Observable stream from the store
    return this.os.all$.pipe(
      tap(objects => {
        if (!objects.length) {
          this.store.dispatch(new Actions.TriggerSync('#'))
        }
      }),
      filter(objects => objects.length > 0),
      take(1)
    )
  }

  constructor(protected store: Store<any>, protected os: ObjectService) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.getFromStoreOrAPI().pipe(
      switchMap(() => of(true)),
      catchError(() => of(false))
    )
  }
}
