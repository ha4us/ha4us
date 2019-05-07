import { Injectable, Injector } from '@angular/core'
import {
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
  HttpResponse,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http'

import { Observable } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'

import { AuthService } from '../services/auth.service'
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(protected auth: AuthService) {}
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        'access-control-expose-headers': 'Authorization',
      },
    })

    return next.handle(request).pipe(
      tap((ev: HttpEvent<any>) => {
        if (ev instanceof HttpResponse) {
          const authHeader = ev.headers.get('Authorization')
          if (authHeader) {
            const [_, token] = authHeader.split(' ')
            this.auth.token = token
          }
        }
      }),
      catchError((err: HttpErrorResponse, caught) => {
        if (err.status === 401 || err.status === 403) {
          console.error('Authorization failed', err)
          return this.auth.notAuthorized(err)
        }
      })
    )
  }
}
