import { Injectable } from '@angular/core'
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router'
import { Observable, of, from, combineLatest, EMPTY } from 'rxjs'

import { PreloadObjectsGuard } from './preload-objects.guard'
import { AuthGuard } from './auth.guard'

import { ObjectService } from '../services/object.service'
import { Ha4usApiService } from '../services/ha4us-api.service'
import { AuthService } from '../services/auth.service'
import { MediaService } from '../services/media.service'
import { map, tap, mergeMap, switchMap } from 'rxjs/operators'

const debug = require('debug')('ha4us:gui:guard')

@Injectable({
  providedIn: 'root',
})
export class Ha4usGuard implements CanActivate, CanActivateChild {
  constructor(
    protected api: Ha4usApiService,
    protected os: ObjectService,
    protected ms: MediaService,
    protected as: AuthService,
    protected auth: AuthGuard,
    private router: Router
  ) {}

  checkAuth(state: RouterStateSnapshot) {
    debug('Checking interal auth state')

    if (this.as.isLoggedIn) {
      debug(`User currently logged in`)
      return of(true)
    } else {
      return from(
        this.as.canRefresh().catch(e => {
          debug('Refresh failed -> going to login page', e)
          this.as.nextState = state
          this.router.navigate(['/login'], {
            replaceUrl: false,
            skipLocationChange: false,
          })
          return false
        })
      )
    }
  }

  loadObjects() {
    return this.os.getObjects().pipe(map(() => true))
  }

  loadMedia() {
    return this.ms.medias$.pipe(
      switchMap(medias => {
        if (medias && medias.length > 0) {
          return of(medias)
        } else {
          debug('Pre-Loading media....')
          return this.api.mediaQuery({}).pipe(
            tap(objects => {
              debug(`${objects.length} medias loaded`)
              this.ms.add(objects)
            })
          )
        }
      }),
      map(() => true)
    )
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    debug('Can Activate', next.routeConfig.path)

    return this.checkAuth(state).pipe(
      mergeMap(() => combineLatest(this.loadMedia(), this.loadObjects())),
      map(val => {
        debug('Returned', val)
        return true
      })
    )
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    debug('Can Activate Child', next.routeConfig.path, next.routeConfig.data)
    return this.checkAuth(state).pipe(
      map(val => {
        debug('Auth result', val)
        return true
      })
    )
  }
}
