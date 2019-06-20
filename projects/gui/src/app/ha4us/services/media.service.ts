import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { MatIconRegistry } from '@angular/material'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { Ha4usMedia, Ha4usMediaDefinition } from '@ha4us/core'
import { combineLatest, Observable, of, Subject } from 'rxjs'
import { map, mergeMap, take, tap } from 'rxjs/operators'
import { MediaSearchEvent } from '../models'
import { MediaQuery } from '../state/media.query'
import { MediaStore } from '../state/media.store'

import { Ha4usApiService } from './ha4us-api.service'

const MEDIA_URN_PREFIX = 'urn:ha4us:media:'

const MEDIA_REGEX = /^(?:urn:ha4us:media:)([a-z0-9]{24})$/

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  // public action$: Subject<mediaActions.MediaActionsUnion> = new Subject()
  //
  public static readonly baseURL = 'api/media/'

  medias$ = this.query.selectAll()
  cache$ = this.query.select(state => state.cache)
  search$ = this.query.select(state => state.search)

  selectedMedia$ = this.query.selectActive()

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
    protected registry: MatIconRegistry,
    protected api: Ha4usApiService,
    protected store: MediaStore,
    protected query: MediaQuery
  ) {}

  public getHTMLByHttp(urn: string): Observable<SafeHtml> {
    return this.http
      .get(MediaService.getURL(urn), { responseType: 'text' })
      .pipe(
        map((data: any) => {
          const output = this.ds.bypassSecurityTrustHtml(data)
          const cache = { ...this.query.getValue().cache }
          cache[urn] = output
          this.store.update({ cache })

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
    this.store.update({ search })
  }

  public getOne(urn: string): Observable<Ha4usMedia> {
    return this.query.selectEntity(urn)
  }

  upsertOne(media: Ha4usMedia) {
    this.api
      .mediaPut(media)
      .pipe(tap(result => this.store.update(media.urn, media)))
      .subscribe()
  }

  removeOne(urn: string) {
    this.api
      .mediaDelete(urn)
      .pipe(tap(media => this.store.remove(urn)))
      .subscribe()
  }
  add(medias: Ha4usMedia[]) {
    this.store.add(medias)
  }

  select(urn: string) {
    this.store.setActive(urn)
  }

  upload(
    blob: Blob,
    data: Partial<Ha4usMediaDefinition>
  ): Observable<Ha4usMedia> {
    return this.api
      .mediaPost(blob, data)
      .pipe(tap(newData => this.store.add(newData)))
  }
}
