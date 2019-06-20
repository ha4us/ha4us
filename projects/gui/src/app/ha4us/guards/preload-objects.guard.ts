import { Injectable } from '@angular/core'
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router'
import { Observable, of } from 'rxjs'

import { map, tap, filter, take, switchMap, catchError } from 'rxjs/operators'

import { ObjectService } from '../services/object.service'

@Injectable({
  providedIn: 'root',
})
export class PreloadObjectsGuard implements CanActivate {
  // wrapping the logic so we can .switchMap() it#

  constructor(protected os: ObjectService) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return true
  }
}
