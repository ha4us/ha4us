import { Injectable } from '@angular/core'
import {
    HttpClient,
    HttpHeaders,
    HttpParams,
    HttpResponse,
    HttpEventType,
} from '@angular/common/http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { AuthInfo } from '../models'

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private loginUrl = '/api/auth/login'
    private logoutUrl = '/api/auth/logout'
    private refreshUrl = '/api/auth/refresh'
    constructor(private http: HttpClient) { }

    login(username: string, password: string): Promise<AuthInfo> {
        const options = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        }

        return this.http
            .post<AuthInfo>(this.loginUrl, { username, password }, options)
            .toPromise()
    }

    refresh(): Promise<AuthInfo> {
        return this.http.get<AuthInfo>(this.refreshUrl).toPromise()
    }

    logout() {
        const options = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        }

        return this.http.post(this.logoutUrl, options).toPromise()
    }
}
