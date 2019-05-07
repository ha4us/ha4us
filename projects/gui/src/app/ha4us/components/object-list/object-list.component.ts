import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core'
import { Ha4usObject, MqttUtil } from '@ha4us/core'

import { ClipboardService } from '@ulfalfa/ng-util'

import { Subscription } from 'rxjs'

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling'
import { SelectionModel } from '@angular/cdk/collections'

import { ObjectService } from '../../services/object.service'
import { StatesService } from '../../services/state.service'

import {
  Ha4usObjectAction,
  Ha4usObjectActionType,
} from '../object/object.component'

const debug = require('debug')('ha4us:gui:object')

export interface Ha4usObjectCollectionEvent {
  type: Ha4usObjectActionType
  objects: Ha4usObject[]
  source: Ha4usObject
}

@Component({
  selector: 'ha4us-object-list',
  templateUrl: './object-list.component.html',
  styleUrls: ['./object-list.component.scss'],
})
export class ObjectListComponent implements OnInit, OnDestroy {
  @Output() action = new EventEmitter<Ha4usObjectCollectionEvent>()

  selection = new SelectionModel<Ha4usObject>(true)
  sub: Subscription

  filteredObjects = this.os.searchResult$
  constructor(protected os: ObjectService, protected states: StatesService) {}

  ngOnInit() {
    this.sub = this.selection.changed.subscribe(change => {
      this.action.emit({
        type: 'edit',
        objects: this.selection.selected,
        source: this.selection.selected[0],
      })
    })
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe()
    }
  }

  scrolled(viewport: CdkVirtualScrollViewport, index: number) {
    // this.scrolledIndex.set(viewport, index);
  }

  doAction(event: Ha4usObjectAction) {
    this.action.emit({
      type: event.type,
      objects: this.selection.selected,
      source: event.object,
    })
  }
}
