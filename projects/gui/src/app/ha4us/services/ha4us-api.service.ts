import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { map, tap, filter } from 'rxjs/operators'
import {
  HttpClient,
  HttpParams,
  HttpRequest,
  HttpEventType,
  HttpResponse,
} from '@angular/common/http'

import {
  Ha4usObject,
  IPager,
  Ha4usObjectQuery,
  Ha4usError,
  HA4US_OBJECT,
  Ha4usMedia,
  Ha4usMediaDefinition,
} from '@ha4us/core'

import { MediaSearchEvent } from '../models'
import { MediaService } from './media.service'

const debug = require('debug')('ha4us:gui:api')

const URL_API_OBJECT = '/api/object'
const URL_API_MEDIA = '/api/media'
@Injectable({
  providedIn: 'root',
})
export class Ha4usApiService {
  uploadProgress: number
  constructor(protected http: HttpClient) {}

  objectGet(query: Ha4usObjectQuery): Observable<Ha4usObject[]> {
    let params = new HttpParams()

    params = params.set('query', JSON.stringify(query))

    return this.http
      .get(URL_API_OBJECT, {
        params,
      })
      .pipe(map((data: IPager<Ha4usObject>) => data.data))
  }

  objectGetOne<T extends Ha4usObject>(topic: string): Promise<T> {
    return this.http
      .get(URL_API_OBJECT + '/' + encodeURIComponent(topic))
      .toPromise()
      .catch(Ha4usError.wrapErr) as Promise<T>
  }

  objectPut<T extends Ha4usObject>(obj: T, topic?: string): Observable<T> {
    debug(`Putting object ${topic}`, obj)
    topic = topic ? topic : obj.topic
    return this.http.put(URL_API_OBJECT + '/' + topic, obj) as Observable<T>
  }

  objectPost<T extends Ha4usObject>(obj: Partial<Ha4usObject>): Observable<T> {
    return this.http.post(URL_API_OBJECT, obj) as Observable<T>
  }

  objectDelete<T extends Ha4usObject>(topic: string): Observable<T> {
    return this.http.delete(
      URL_API_OBJECT + '/' + encodeURIComponent(topic)
    ) as Observable<T>
  }

  mediaQuery(search: Partial<MediaSearchEvent>): Observable<Ha4usMedia[]> {
    let params = new HttpParams()

    params = params.set('mimePattern', search.mimeType || '*')

    if (search.tags) {
      params = params.set('tags', search.tags.join(','))
    }

    return this.http
      .get(URL_API_MEDIA, {
        params,
      })
      .pipe(map((result: any) => result.data))
  }
  mediaPut(aMedia: Ha4usMedia): Observable<Ha4usMedia> {
    return this.http.put(URL_API_MEDIA, aMedia).pipe(map(() => aMedia))
  }
  mediaPost(
    blob: Blob,
    data: Partial<Ha4usMediaDefinition>
  ): Observable<Ha4usMedia> {
    const form: FormData = new FormData()

    Object.keys(data).forEach(key => {
      form.append(key, data[key])
    })

    form.append('file', blob, data.filename || 'unknown')

    const req = new HttpRequest<FormData>('POST', URL_API_MEDIA, form, {
      reportProgress: true, // , responseType: 'text'
    })

    return this.http.request(req).pipe(
      tap(event => {
        switch (event.type) {
          case HttpEventType.Sent:
            this.uploadProgress = 1
            break
          case HttpEventType.UploadProgress:
            this.uploadProgress = Math.round(
              (100 * event.loaded) / event.total
            )
            break
          case HttpEventType.Response:
            this.uploadProgress = undefined
        }
      }),
      filter(event => event.type === HttpEventType.Response),
      map((event: HttpResponse<Ha4usMedia>) => event.body)
    )
  }
  mediaDelete(urn: string) {
    return this.http.delete(URL_API_MEDIA + '/' + urn)
  }
}
