import { HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { RouterStateSnapshot } from '@angular/router'
import { JwtHelperService } from '@auth0/angular-jwt'
import { Ha4usUser } from '@ha4us/core'
import { Observable, of, ReplaySubject } from 'rxjs'
import { AuthInfo } from '../models'
import { UserService } from './user.service'

const debug = require('debug')('ha4us:gui:auth:service')
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private jwtHelper: JwtHelperService = new JwtHelperService()

  public authInfo$: ReplaySubject<AuthInfo> = new ReplaySubject(1)

  private authInfo: AuthInfo

  public nextState: RouterStateSnapshot

  get isLoggedIn(): boolean {
    return (
      !!this.authInfo && !this.jwtHelper.isTokenExpired(this.authInfo.token)
    )
  }

  constructor(protected us: UserService) {}

  public hasRole(role: string): boolean {
    return (
      role === 'guest' ||
      (this.isLoggedIn &&
        this.authInfo.user.roles.findIndex(aRole => aRole === role) > -1)
    )
  }

  public isAdmin(): boolean {
    return this.hasRole('admin')
  }

  set token(token: string) {
    const tokenData = this.jwtHelper.decodeToken(token)
    this.authInfo = tokenData
    this.authInfo$.next(tokenData)
    this.authInfo.token = token
  }

  public notAuthorized(err: HttpErrorResponse): Observable<any> {
    this.authInfo = undefined
    this.authInfo$.next(undefined)
    return of(undefined)
  }

  public canRefresh(): Promise<boolean> {
    return this.us.refresh().then((auth: AuthInfo) => {
      debug(`Userinfo of ${auth.user.username} refreshed`)
      this.authInfo = auth
      this.authInfo$.next(auth)

      return true
    })
  }

  public login(username: string, password: string): Promise<Ha4usUser> {
    return this.us.login(username, password).then(auth => {
      this.authInfo = auth
      this.authInfo$.next(auth)
      return auth.user
    })
  }

  public logout(): Promise<void> {
    return this.us.logout().then(() => {
      this.authInfo = undefined
      this.authInfo$.next(undefined)
      return
    })
  }
}
