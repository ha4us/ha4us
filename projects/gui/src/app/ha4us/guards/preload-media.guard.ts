import { Injectable } from '@angular/core'
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router'
import { Observable, of } from 'rxjs'
import { tap, filter, take, concatMap, catchError } from 'rxjs/operators'

import { Store, select } from '@ngrx/store'

import { MediaService } from '../services/media.service'

@Injectable({
  providedIn: 'root',
})
export class PreloadMediaGuard implements CanActivate {
  constructor() {}

  canActivate(): Observable<boolean> {
    return of(true)
  }
}
