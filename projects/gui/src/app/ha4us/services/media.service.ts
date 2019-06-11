import { Injectable } from '@angular/core'
import {
  HttpClient,
  HttpParams,
  HttpRequest,
  HttpResponse,
  HttpEvent,
  HttpEventType,
} from '@angular/common/http'

import { DomSanitizer, SafeUrl, SafeHtml } from '@angular/platform-browser'

import { MatIconRegistry } from '@angular/material'

import { Observable, from, Subject, of, combineLatest } from 'rxjs'
import {
  map,
  mergeMap,
  tap,
  switchMap,
  catchError,
  take,
  filter,
} from 'rxjs/operators'

import {
  IPager,
  Ha4usError,
  Ha4usMedia,
  Ha4usMediaDefinition,
} from '@ha4us/core'

import { Ha4usApiService } from './ha4us-api.service'
import { MediaSearchEvent } from '../models'

import { Store, select } from '@ngrx/store'
import * as Actions from '../store/media/actions'

import * as Selectors from '../store/media/selectors'
import { Actions as FxActions, Effect, ofType } from '@ngrx/effects'

const MEDIA_URN_PREFIX = 'urn:ha4us:media:'

const MEDIA_REGEX = /^(?:urn:ha4us:media:)([a-z0-9]{24})$/

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  // public action$: Subject<mediaActions.MediaActionsUnion> = new Subject()
  //
  public static readonly baseURL = 'api/media/'

  medias$ = this.store.pipe(select(Selectors.selectAllMedia))
  cache$ = this.store.pipe(select(Selectors.selectMediaCache))
  search$ = this.store.pipe(select(Selectors.getQuery))

  selectedMedia$ = this.store.pipe(select(Selectors.selectedMedia))

  allTags$ = this.medias$.pipe(
    map(medias => {
      return !medias
        ? []
        : medias.reduce((res, media) => {
            if (media.tags) {
              media.tags.forEach(tag => {
                if (res.indexOf(tag) < 0) {
                  res.push(tag)
                }
              })
            }
            return res
          }, [])
    })
  )

  searchResult$ = combineLatest(this.medias$, this.search$).pipe(
    map(([medias, search]) => {
      const mimeMatch = new RegExp(search.mimeType.replace('*', '.*'))

      const result = medias
        .filter(media => mimeMatch.test(media.contentType))
        .filter(media =>
          search.tags.reduce(
            (res, tagToFind) =>
              res && media.tags && media.tags.indexOf(tagToFind) > -1,
            true
          )
        )
        .filter(
          media =>
            !search.fileName ||
            search.fileName.length === 0 ||
            media.filename.match(new RegExp(search.fileName, 'i'))
        )

      return result
    })
  )

  public readonly uploads = new Subject<Ha4usMedia>()

  public static getURL(urnOrId: string) {
    const id = MediaService.getId(urnOrId)

    return MediaService.baseURL + id
  }

  public static getCSSURL(urnOrId: string) {
    return 'url(' + MediaService.getURL(urnOrId) + ')'
  }
  public static getURN(id: string) {
    return MEDIA_URN_PREFIX + id
  }

  public static getId(urnOrId: string) {
    const matchURN = urnOrId.match(MEDIA_REGEX)

    if (matchURN) {
      const [_, id] = matchURN
      return id
    } else {
      return urnOrId
    }
  }

  public static isMime(item: Ha4usMedia, mime: string) {
    const regex = new RegExp('^' + mime)
    return regex.test(item.contentType)
  }

  public static getMainMime(mimeType: string): string {
    const match = /^([a-zA-Z]*)\/([a-zA-Z0-9]*)(?:.*)$/.exec(mimeType)

    if (match) {
      const [mime, main, sub] = match

      if (sub === 'svg') {
        return sub
      } else {
        return main
      }
    } else {
      return 'unknown'
    }
  }

  constructor(
    protected http: HttpClient,
    protected ds: DomSanitizer,
    protected store: Store<any>,
    protected action$: FxActions,
    protected registry: MatIconRegistry,
    protected api: Ha4usApiService
  ) {}

  public getHTMLByHttp(urn: string): Observable<SafeHtml> {
    return this.http
      .get(MediaService.getURL(urn), { responseType: 'text' })
      .pipe(
        map((data: any) => {
          const output = this.ds.bypassSecurityTrustHtml(data)
          this.store.dispatch(new Actions.Cache(urn, output))
          return output
        })
      )
  }

  public getHTML(urn: string): Observable<SafeHtml> {
    return this.cache$.pipe(
      take(1),
      mergeMap(cache => {
        if (cache[urn]) {
          return of(cache[urn])
        } else {
          return this.getHTMLByHttp(urn)
        }
      })
    )
  }

  public setSearch(search: MediaSearchEvent) {
    this.store.dispatch(new Actions.Search(search))
  }

  public getOne(urn: string): Observable<Ha4usMedia> {
    return this.store.pipe(select(Selectors.selectOne(urn)))
  }

  upsertOne(media: Ha4usMedia) {
    this.store.dispatch(new Actions.UpsertOne(media))
  }

  removeOne(urn: string) {
    this.store.dispatch(new Actions.RemoveOne(urn))
  }
  add(medias: Ha4usMedia[]) {
    this.store.dispatch(new Actions.Add(medias))
  }

  select(urn: string) {
    this.store.dispatch(new Actions.Select(urn))
  }

  upload(
    blob: Blob,
    data: Partial<Ha4usMediaDefinition>
  ): Observable<Ha4usMedia> {
    return this.api
      .mediaPost(blob, data)
      .pipe(tap(newData => this.store.dispatch(new Actions.Add(newData))))
  }
}
