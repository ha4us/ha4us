import { Injectable } from '@angular/core'

import { Observable } from 'rxjs'
import { Store, select } from '@ngrx/store'
import {
  selectSearched,
  getTopics,
  getSearch,
  getTopicHierarchie,
  getAllTags,
  getAllObjects,
  selectOne,
  matchByPattern,
  selectRoles,
  selectByRole,
  matchRole,
  getObjectEntities,
} from '../store/object/selector'

import { State } from '../store/object/state'
import * as Actions from '../store/object/actions'

const defaultsDeep = require('lodash/defaultsDeep')

import {
  Ha4usObject,
  IPager,
  HA4US_OBJECT,
  Ha4usObjectQuery,
  Ha4usError,
  Ha4usRole,
} from '@ha4us/core'
import { Ha4usApiService } from './ha4us-api.service'
import { MatDialog } from '@angular/material'
import { ObjectEditDialogComponent } from '../components/object-edit-dialog/object-edit-dialog.component'
const debug = require('debug')('ha4us:gui:object:service')

@Injectable({
  providedIn: 'root',
})
export class ObjectService {
  readonly searchResult$ = this.store.pipe(select(selectSearched))
  readonly topics$ = this.store.pipe(select(getTopics))
  readonly search$ = this.store.pipe(select(getSearch))
  readonly topicTree$ = this.store.pipe(select(getTopicHierarchie))
  readonly allTags$ = this.store.pipe(select(getAllTags))
  readonly roles$ = this.store.pipe(select(selectRoles))
  readonly all$ = this.store.pipe(select(getAllObjects))
  readonly objects$ = this.store.pipe(select(getObjectEntities))

  constructor(
    protected api: Ha4usApiService,
    protected store: Store<State>,
    protected dialog: MatDialog
  ) {}

  public observeOne(topic: string): Observable<Ha4usObject> {
    return this.store.pipe(select(selectOne(topic)))
  }
  public observe(pattern: string): Observable<Ha4usObject[]> {
    return this.store.pipe(select(matchByPattern(pattern)))
  }
  public observeRole(role: Ha4usRole | string | RegExp) {
    if (typeof role === 'string') {
      return this.store.pipe(select(selectByRole(role)))
    } else {
      return this.store.pipe(select(matchRole(role)))
    }
  }

  public updateOne(topic: string, changes: Partial<Ha4usObject>): void {
    this.store.dispatch(new Actions.UpdateOne({ id: topic, changes }))
  }

  public upsert(obj: Ha4usObject) {
    this.store.dispatch(new Actions.UpsertOne(obj))
  }

  addMany(obj: Ha4usObject[]) {
    this.store.dispatch(new Actions.SyncAddMany(obj))
  }

  public remove(topic: string) {
    this.store.dispatch(new Actions.RemoveOne(topic))
  }

  public new<T extends Ha4usObject>(
    topic: string,
    data?: Partial<Ha4usObject>
  ): T {
    const newObject = defaultsDeep(data, HA4US_OBJECT)
    newObject.topic = topic
    return newObject as T
  }

  search(value: Ha4usObjectQuery) {
    this.store.dispatch(new Actions.Search(value))
  }

  create(topic: string, partial: Partial<Ha4usObject> = {}): Ha4usObject {
    const result = this.new(topic, partial)
    this.upsert(result)
    return result
  }

  edit(topic: string) {
    debug('Editing', topic)
    const dialogRef = this.dialog.open(ObjectEditDialogComponent, {
      data: { topic },
    })

    dialogRef.afterClosed().subscribe(result => {
      debug('The dialog was closed', result)
      if (result) {
        this.upsert(result)
      }
    })
  }
}
