import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
} from '@angular/core'
import { ObjectService } from '../../services/object.service'
import { Ha4usObject, MqttUtil } from '@ha4us/core'
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree'
import { FlatTreeControl } from '@angular/cdk/tree'
import { TopicTreeNode, TopicTreeDataBase } from './topic-tree-database'
import { SelectionModel } from '@angular/cdk/collections'
import { ClipboardService } from '@ulfalfa/ng-util'

import { Subscription } from 'rxjs'
import { Ha4usObjectAction } from '../object/object.component'
import { Ha4usObjectCollectionEvent } from '../object-list/object-list.component'

export type TreeNodeEventType = 'edit' | 'delete' | 'addchild' | 'watch'
export interface TreeNodeEvent {
  type: TreeNodeEventType
  objects: Ha4usObject[]
}

const debug = require('debug')('ha4us:gui:object-tree')
@Component({
  selector: 'ha4us-object-tree',
  templateUrl: './object-tree.component.html',
  styleUrls: ['./object-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ObjectTreeComponent implements OnInit {
  @Output() action: EventEmitter<
    Ha4usObjectCollectionEvent
  > = new EventEmitter()

  treeControl = new FlatTreeControl<TopicTreeNode<Ha4usObject>>(
    node => node.level,
    node => node.children.length > 0
  )
  // this.os.searchResult$

  treeFlattener = new MatTreeFlattener(
    (node: TopicTreeNode<Ha4usObject>, level: number) => node,
    node => node.level,
    node => node.children.length > 0,
    node => node.children
  )
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener)

  dataBase = new TopicTreeDataBase<Ha4usObject>(data => data.topic)

  selection = new SelectionModel<Ha4usObject>(true /* multiple */)
  sub: Subscription

  hasChild = (_: number, _nodeData: TopicTreeNode<Ha4usObject>) =>
    _nodeData.children.length > 0

  constructor(protected os: ObjectService, protected cs: ClipboardService) {}
  async ngOnInit() {
    this.sub = this.os.searchResult$.subscribe(data => {
      this.dataBase.data = data
      this.dataSource.data = this.dataBase.root
    })
  }

  doAction(event: Ha4usObjectAction) {
    this.action.emit({
      type: event.type,
      objects: this.selection.selected,
      source: event.object,
    })
  }

  edit(node: TopicTreeNode<Ha4usObject>) {
    if (node.data) {
      this.selection.clear()
      this.selection.select(node.data)
      this.action.emit({
        type: 'edit',
        objects: this.selection.selected,
        source: node.data,
      })
    }
  }

  add(node: TopicTreeNode<Ha4usObject>) {
    const object = this.os.new(MqttUtil.join(node.path))
    this.action.emit({
      type: 'add_child',
      source: object,
      objects: [object],
    })
  }

  toggle(node: TopicTreeNode<Ha4usObject>) {
    this.selection.toggle(node.data)
    if (!this.treeControl.isExpanded(node)) {
      const descendants = this.treeControl
        .getDescendants(node)
        .map(desc => desc.data)

      this.selection.isSelected(node.data)
        ? this.selection.select(...descendants)
        : this.selection.deselect(...descendants)

      debug('Selection', this.selection.selected)
    }
  }
}
