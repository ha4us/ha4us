import { Injectable } from '@angular/core'

import { Router, ActivatedRoute } from '@angular/router'
import { Subscription, Observable, of, from } from 'rxjs'
import { map, take, mergeMap, tap } from 'rxjs/operators'
import { Store, select } from '@ngrx/store'
import { Update } from '@ngrx/entity'

import { ObjectService } from '@ha4us/ng'
import cloneDeep from 'lodash/cloneDeep'

import {
  getEntities,
  getSelected,
  getSelectedEntity,
  getEditMode,
  selectById,
  getMainContainer,
  getVisors,
  visorConfiguration,
  State,
  Actions,
} from '../store/'

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
const debug = require('debug')('ha4us:gui:visor:service')

@Injectable({
  providedIn: 'root',
})
export class VisorService {
  editMode$ = this.store.pipe(select(getEditMode))
  selected$ = this.store.pipe(select(getSelected))
  mainContainer$ = this.store.pipe(select(getMainContainer))
  visors$ = this.store.pipe(select(getVisors))
  visorConfig$ = this.store.pipe(select(visorConfiguration))
  entities$ = this.store.pipe(select(getEntities))

  get selectedEntity(): Observable<VisorEntity> {
    return this.store.pipe(select(getSelectedEntity))
  }

  constructor(
    protected store: Store<State>,
    protected router: Router,
    protected os: ObjectService
  ) {}

  setEditMode(editMode: boolean) {
    this.store.dispatch(new Actions.SetEditMode(editMode))
  }
  setSelected(id?: VisorId) {
    this.store.dispatch(new Actions.SetSelected(id))
  }

  getEntity(id: VisorId): Observable<VisorEntity> {
    return this.store.pipe(select(selectById(id)))
  }

  addComponent(entity: VisorEntity, parent?: VisorId) {
    this.store.dispatch(new Actions.AddComponent(entity))
    if (parent) {
      this.store.dispatch(new Actions.AddChild(parent, entity.id))
    }
  }

  update(id: VisorId, changes: Partial<VisorEntity>) {
    this.store.dispatch(new Actions.UpdateComponent(id, changes))
  }

  updateComponent(data: Update<VisorEntity>) {
    this.store.dispatch(
      new Actions.UpdateComponent(data.id as string, data.changes)
    )
  }

  removeChild(child: VisorId, parent: VisorId) {
    this.store.dispatch(new Actions.RemoveChild(parent, child))
  }

  remove(id: VisorId) {
    this.store.dispatch(new Actions.RemoveComponent(id))
  }

  sync(entities: VisorEntity[]) {
    this.store.dispatch(new Actions.Loaded(entities))
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
    this.store.dispatch(new Actions.SetMain(id))
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
