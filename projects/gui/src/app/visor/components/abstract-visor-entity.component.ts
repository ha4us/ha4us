import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  HostBinding,
  HostListener,
} from '@angular/core'

import { VisorService } from '../services/visor.service'

import { Subscription, Observable, ReplaySubject, Subject } from 'rxjs'
import {
  map,
  take,
  switchMap,
  debounceTime,
  tap,
  distinctUntilChanged,
} from 'rxjs/operators'

import {
  Visor,
  VisorEntityType,
  VisorWidget,
  VisorEntity,
  VisorId,
} from '../models'

import { ResizeEvent } from 'angular-resizable-element'
import { DropEvent } from '@ulfalfa/angular-draggable-droppable'

const debug = require('debug')('ha4us:gui:visor:abstractvisor')

export abstract class AbstractVisorEntity
  implements OnInit, OnDestroy, VisorEntity {
  type
  id$: ReplaySubject<VisorId> = new ReplaySubject(1)
  id: VisorId
  @Input('id')
  set _id(val: VisorId) {
    if (val) {
      this.id = val
      this.id$.next(val)
    }
  }
  @Input() parent: VisorId
  @Input() styles: any

  change = new Subject<{ id: VisorId; changes: Partial<VisorEntity> }>()

  @HostBinding('style.left.px') x: number
  @HostBinding('style.top.px') y: number

  width: number
  height: number

  public isResizing: boolean
  public isDragging: boolean

  public config: Observable<VisorEntity>

  public selected: Observable<VisorId>
  public selectedId: VisorId

  public get isSelected(): boolean {
    return this.selectedId === this.id
  }

  public get resizableX(): boolean {
    return !!this.width && this.editMode
  }

  public get resizableY(): boolean {
    return !!this.height && this.editMode
  }

  public get resizeEdges() {
    return {
      bottom: this.editMode && !!this.height,
      right: this.editMode && !!this.width,
      top: this.editMode && !!this.height,
      left: this.editMode && !!this.width,
    }
  }

  public editMode: boolean

  public sub: Subscription

  @HostListener('mousedown')
  onMouseDown($event) {
    // the default prevented flag is set, that the parent is not infected
    // by actions of the child. Inspite of event.stopPropagation, the resize
    // listener is never called
    //
    if (!$event.defaultPrevented) {
      $event.preventDefault()
      this.selected.pipe(take(1)).subscribe(selectedId => {
        const selected = selectedId === this.id
        if (!selected) {
          this.vs.setSelected(this.id)
        }
      })
    }
  }

  constructor(protected vs: VisorService) {}

  ngOnInit() {
    this.config = this.id$.pipe(
      distinctUntilChanged(),
      switchMap((id: VisorId) => this.vs.getEntity(id))
    )

    this.selected = this.vs.selected$

    this.sub = this.config.subscribe(data => {
      if (data) {
        debug('Update entity view', data)
        Object.assign(this, data)
      }
    })

    this.sub.add(
      this.vs.selected$.subscribe(data => {
        this.selectedId = data
      })
    )

    this.sub.add(this.vs.editMode$.subscribe(mode => (this.editMode = mode)))

    this.sub.add(
      this.change
        .pipe(
          tap(changes => {
            Object.assign(this, changes.changes)
          })
        )
        .subscribe(data => this.vs.updateComponent(data))
    )
  }

  public ngOnDestroy() {
    this.sub.unsubscribe()
  }

  public resizeStart($event) {
    this.isResizing = true
  }

  public resizeEnd($event: ResizeEvent) {
    const changes: Partial<Visor> = {}

    if (this.isResizing) {
      if ($event.edges.right) {
        changes.width = this.width + ($event.edges.right as number)
      }
      if ($event.edges.left) {
        changes.width = this.width - ($event.edges.left as number)
        changes.x = this.x + ($event.edges.left as number)
      }
      if ($event.edges.bottom) {
        changes.height = this.height + ($event.edges.bottom as number)
      }

      if ($event.edges.top) {
        changes.height = this.height - ($event.edges.top as number)
        changes.y = this.y + ($event.edges.top as number)
      }

      this.change.next({ id: this.id, changes })
    }
    this.isResizing = false
  }

  public dragValid(event: { x: number; y: number }) {
    return this.editMode && !this.isResizing && this.x && this.y
  }

  public dragStart($event) {
    this.isDragging = true
  }
  public dragEnter(event) {}
  public dragOver(event) {}
  public dragLeave(event) {}
  public dragEnd($event) {
    if (this.isDragging && !this.isResizing) {
      const changes: Partial<Visor> = {}

      if ($event.x) {
        changes.x = this.x + $event.x
      }
      if ($event.y) {
        changes.y = this.y + $event.y
      }

      this.change.next({ id: this.id, changes })
    }
    this.isDragging = false
  }

  public abstract drop(event): void

  public remove() {
    if (this.parent) {
      this.vs.removeChild(this.id, this.parent)
    }
  }
}
