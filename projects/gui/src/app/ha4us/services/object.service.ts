import { Injectable } from '@angular/core'
import { MatDialog } from '@angular/material'
import {
  Ha4usObject,
  Ha4usObjectQuery,
  Ha4usRole,
  HA4US_OBJECT,
} from '@ha4us/core'
import { Observable } from 'rxjs'
import { catchError, switchMap, take, tap } from 'rxjs/operators'
import { ObjectEditDialogComponent } from '../components/object-edit-dialog/object-edit-dialog.component'
import { ObjectsQuery } from '../state/objects.query'
import { ObjectsStore } from '../state/objects.store'
import { Ha4usApiService } from './ha4us-api.service'

const defaultsDeep = require('lodash/defaultsDeep')

const debug = require('debug')('ha4us:gui:object:service')

@Injectable({
  providedIn: 'root',
})
export class ObjectService {
  readonly searchResult$ = this.query.searchResult$
  readonly topics$ = this.query.topics$
  readonly search$ = this.query.search$
  readonly topicTree$ = this.query.topicTree$
  readonly allTags$ = this.query.allTags$
  readonly roles$ = this.query.roles$

  readonly all$ = this.query.all$
  readonly objects$ = this.query.objects$

  constructor(
    protected api: Ha4usApiService,
    protected store: ObjectsStore,
    protected query: ObjectsQuery,
    protected dialog: MatDialog
  ) {}

  public observeOne(topic: string): Observable<Ha4usObject> {
    return this.query.selectEntity(topic)
  }
  public observe(pattern: string): Observable<Ha4usObject[]> {
    return this.query.selectByPattern(pattern)
  }
  public observeRole(
    role: Ha4usRole | string | RegExp
  ): Observable<Ha4usObject[]> {
    return this.query.selectByRole(role)
  }

  public updateOne(topic: string, changes: Partial<Ha4usObject>): void {
    debug(`UpdateOne ${topic}`, changes)
    const update$ = this.query.selectEntity(topic).pipe(
      take(1),
      switchMap(obj => this.api.objectPut(obj))
    )
    this.store.update(topic, changes)
    update$.subscribe()
  }

  public upsert(obj: Ha4usObject) {
    this.api
      .objectPut(obj)
      .pipe(
        catchError(err => this.api.objectPost(obj)),
        tap(puttedObj => this.store.upsert(obj.topic, obj))
      )
      .subscribe()
  }

  public remove(topic: string) {
    this.api
      .objectDelete(topic)
      .pipe(tap(obj => this.store.remove(obj.topic)))
      .subscribe()
  }

  public new<T extends Ha4usObject>(
    topic: string,
    data?: Partial<Ha4usObject>
  ): T {
    const newObject = defaultsDeep(data, HA4US_OBJECT)
    newObject.topic = topic
    return newObject as T
  }

  search(search: Ha4usObjectQuery) {
    if (typeof search === 'string') {
      this.store.update({ search: { pattern: search } })
    } else {
      this.store.update({ search })
    }
  }

  create(topic: string, partial: Partial<Ha4usObject> = {}): Ha4usObject {
    const result = this.new(topic, partial)
    this.upsert(result)
    return result
  }

  edit(topic: string) {
    debug('Editing', topic)
    const dialogRef = this.dialog.open(ObjectEditDialogComponent, {
      panelClass: 'max-height-dialog',
      data: { topic },
    })

    dialogRef.afterClosed().subscribe(result => {
      debug('The dialog was closed', result)
      if (result) {
        this.upsert(result)
      }
    })
  }

  getObjects(): Observable<Ha4usObject[]> {
    const request$ = this.api
      .objectGet('#')
      .pipe(tap(objects => this.store.set(objects)))

    return this.query.getHasCache() ? this.query.all$ : request$
  }
}
