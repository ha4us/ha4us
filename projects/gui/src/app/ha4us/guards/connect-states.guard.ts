import { Injectable } from '@angular/core'
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { StatesService } from '../services/state.service'

const debug = require('debug')('ha4us:gui:states:guard')
@Injectable({
  providedIn: 'root',
})
export class ConnectStatesGuard implements CanActivate {
  constructor(protected states: StatesService) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    debug('Ensure connected to mqtt via websockets')
    return this.states.client.connect().pipe(
      tap(data => debug('Connectec...', data)),
      map(() => true)
    )
  }
}
