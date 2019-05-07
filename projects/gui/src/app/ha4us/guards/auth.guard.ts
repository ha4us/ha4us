import { Injectable } from '@angular/core'
import {
  CanActivate,
  CanActivateChild,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router'
import { Observable } from 'rxjs'

import { AuthService } from '../services/auth.service'

const debug = require('debug')('ha4us:gui:auth:guard')

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(protected as: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    debug('checking authorization for url', state.url, this.as.isLoggedIn)
    if (this.as.isLoggedIn) {
      debug(`Currently logged in`)
      return true
    } else {
      return this.as.canRefresh().catch(e => {
        debug('Refresh failed', e)
        this.as.nextState = state
        this.router.navigate(['/login'], {
          replaceUrl: false,
          skipLocationChange: false,
        })
        return false
      })
    }
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(next, state)
  }
}
