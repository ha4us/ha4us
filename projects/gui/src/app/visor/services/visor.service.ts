import { Injectable } from '@angular/core'

import { Router, ActivatedRoute } from '@angular/router'
import { Subscription, Observable, of, from, combineLatest } from 'rxjs'
import { map, take, mergeMap, tap } from 'rxjs/operators'

import { ObjectService } from '@ha4us/ng'
import cloneDeep from 'lodash/cloneDeep'

import { VisorQuery } from '../state/visor.query'
import { VisorStore } from '../state/visor.store'

import {
  Visor,
  VisorEntityType,
  VisorId,
  VisorEntity,
  VisorObject,
  VISOR_OBJECT_PREFIX,
  COMMON_CONTROLS,
  WidgetFormDefinition,
  VisorWidget,
} from '../models'
import { WidgetLibEntry } from '@app/widgets'
import { arrayAdd, arrayRemove } from '@datorama/akita'
import { Update } from '@ngrx/entity'
const debug = require('debug')('ha4us:gui:visor:service')

@Injectable({
  providedIn: 'root',
})
export class VisorService {
  editMode$ = this.query.select(state => state.editMode)
  selected$ = this.query.selectActiveId()
  mainContainer$ = this.query.select(state => state.current)
  visors$ = this.query.selectAll({
    filterBy: visor => visor.type === VisorEntityType.Visor,
  })

  visorConfig$ = combineLatest(
    this.mainContainer$,
    this.query.selectAll()
  ).pipe(map(([main, entities]) => ({ main, entities })))

  entities$ = this.query.selectAll()

  get selectedEntity(): Observable<VisorEntity> {
    return this.query.selectActive()
  }

  constructor(
    protected store: VisorStore,
    protected query: VisorQuery,
    protected router: Router,
    protected os: ObjectService
  ) {}

  setEditMode(editMode: boolean) {
    this.store.setEditMode(editMode)
  }
  setSelected(id?: VisorId) {
    this.store.setActive(id)
  }

  getEntity(id: VisorId): Observable<VisorEntity> {
    return this.query.selectEntity(id)
  }

  addComponent(entity: VisorEntity, parent?: VisorId) {
    this.store.add(entity as Visor)
    if (parent) {
      this.store.update(parent, visor => ({
        children: arrayAdd(visor.children, entity.id),
      }))
    }
  }

  update(id: VisorId, changes: Partial<VisorEntity>) {
    this.store.update(id, changes)
  }

  updateComponent(data: Partial<VisorEntity>) {
    this.store.update(data.id, data)
  }

  removeChild(child: VisorId, parent: VisorId) {
    this.store.remove(child)
    this.store.update(parent, visor => ({
      children: arrayRemove(visor.children, child),
    }))
  }

  remove(id: VisorId) {
    this.store.remove(id)
  }

  sync(entities: VisorEntity[]) {
    this.store.set(entities as Visor[])
  }

  goto(id: VisorId, edit = false) {
    debug('Goto Id', id)
    if (edit) {
      this.router.navigate(['visor', id], {
        queryParams: { edit: '' },
      })
    } else {
      this.router.navigate(['visor', id])
    }
  }

  setMain(id: VisorId) {
    this.store.setCurrent(id)
  }

  put(entityId: VisorId): Observable<any> {
    return this.entities$.pipe(
      take(1),
      map(entities => entities[entityId]),
      map(entity => VisorObject.fromEntity(entity)),
      map(obj => this.os.updateOne(obj.topic, obj))
    )
  }
  post(entity: VisorEntity): void {
    debug(`Posting VE ${entity.id}`)

    const vObject = VisorObject.fromEntity(entity)
    return this.os.upsert(vObject)
  }

  delete(entityId: VisorId): void {
    debug(`Deleting VE ${entityId}`)
    const topic = VisorObject.getTopic(entityId)
    this.os.remove(topic)
  }

  create(label: string): Visor {
    return new Visor(label)
  }

  loadAll(): Observable<VisorEntity[]> {
    debug('loading all data')
    return this.os.observe('ha4us/visor/#').pipe(
      tap(vObjects =>
        debug(`${vObjects.length} visorobjects loaded from object store`)
      ),
      map((vObjects: VisorObject[]) => vObjects.map(obj => obj.native))
    )
  }
  createVisorWidget(definition: WidgetLibEntry): VisorWidget {
    const widget = new VisorWidget(
      definition.name,
      definition.width,
      definition.height
    )

    definition.props.forEach(prop => {
      // tslint:disable-next-line
      widget.properties[prop.id] = prop['default'];
    })
    return widget
  }

  getCommonControls() {
    return cloneDeep(COMMON_CONTROLS)
  }
}
