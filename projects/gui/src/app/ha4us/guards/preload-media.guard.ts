import { Injectable } from '@angular/core'
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router'
import { Observable, of } from 'rxjs'
import { tap, filter, take, concatMap, catchError } from 'rxjs/operators'

import { Store, select } from '@ngrx/store'
import * as Actions from '../store/media/actions'
import { State } from '../store/media/state'
import { selectURNs } from '../store/media/selectors'

import { MediaService } from '../services/media.service'

@Injectable({
  providedIn: 'root',
})
export class PreloadMediaGuard implements CanActivate {
  constructor(private store: Store<State>) {}

  getFromStoreOrAPI(): Observable<any> {
    return this.store.pipe(
      select(selectURNs),
      tap(urns => {
        if (!urns || urns.length === 0) {
          this.store.dispatch(new Actions.Get({}))
        }
      }),
      filter(data => data.length > 0),
      take(1)
    )
  }

  canActivate(): Observable<boolean> {
    return this.getFromStoreOrAPI().pipe(
      concatMap(() => of(true)),
      catchError(() => of(false))
    )
  }
}
