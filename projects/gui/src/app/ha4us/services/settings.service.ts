import { Injectable, OnInit } from '@angular/core'
import { Observable, ReplaySubject, of, combineLatest } from 'rxjs'
import {
  pluck,
  map,
  take,
  tap,
  withLatestFrom,
  mergeMap,
  shareReplay,
} from 'rxjs/operators'
import set from 'lodash/set'

import { Ha4usObjectType, MqttUtil } from '@ha4us/core'
import { ObjectService } from './object.service'
import { AuthService } from './auth.service'

import {
  Ha4usGuiSettings,
  DEFAULT_ROLEDEFINITIONS,
  Ha4usGuiBrowserSettings,
  Ha4usGuiUserSettings,
} from '../models'

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  setting$: Observable<Ha4usGuiSettings> = combineLatest(
    this.getUserSettings(),
    this.getBrowserSettings()
  ).pipe(
    map(settings => ({
      user: settings[0],
      browser: settings[1],
    })),

    shareReplay({ refCount: true, bufferSize: 1 })
  )

  test$: Observable<Ha4usGuiSettings>

  constructor(protected os: ObjectService, protected as: AuthService) {}

  observe<T>(path: string): Observable<T> {
    return this.setting$.pipe(pluck(...path.split('.'))) as Observable<T>
  }

  getBrowserSettings(): Observable<Ha4usGuiBrowserSettings> {
    const browserSettings = localStorage.getItem('ha4us')
    return of(
      browserSettings
        ? JSON.parse(browserSettings)
        : {
            id: 'anonym',
          }
    )
  }

  setBrowserSettings(settings: Ha4usGuiBrowserSettings) {
    localStorage.setItem('ha4us', JSON.stringify(settings))
    return of(settings)
  }

  getUserSettings(): Observable<Ha4usGuiUserSettings> {
    return this.as.authInfo$.pipe(
      mergeMap(authInfo =>
        authInfo
          ? this.os
              .observeOne(
                MqttUtil.join('ha4us/gui/config', authInfo.user.username)
              )
              .pipe(map(object => (object ? object.native : undefined)))
          : undefined
      ),
      map((settings: Ha4usGuiUserSettings) =>
        settings
          ? settings
          : {
              roles: DEFAULT_ROLEDEFINITIONS,
              dashboard: {
                tags: [],
              },
            }
      )
    )
  }

  setUserSettings(settings: Ha4usGuiUserSettings) {
    return this.as.authInfo$.pipe(
      map(authInfo => {
        if (authInfo) {
          this.os.upsert({
            topic: MqttUtil.join('ha4us/gui/config', authInfo.user.username),
            can: {
              read: false,
              write: false,
              trigger: false,
            },
            type: Ha4usObjectType.Object,
            tags: [],
            native: settings,
          })
        }
      })
    )
  }

  set(path: string, value: any) {
    this.setting$
      .pipe(
        map(settings => {
          return set(settings, path, value)
        }),

        mergeMap(settings => this.setUserSettings(settings.user)),
        take(1)
      )
      .subscribe(settings => {
        // this.setting$.next(settings)
      })
  }
}
