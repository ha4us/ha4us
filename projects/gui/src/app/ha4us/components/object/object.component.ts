import {
  Component,
  OnInit,
  Input,
  Output,
  ChangeDetectionStrategy,
  EventEmitter,
  ContentChild,
  ContentChildren,
} from '@angular/core'

import { Ha4usObject, MqttUtil } from 'ha4us/core'

import { ClipboardService } from '@ulfalfa/ng-util'

export type Ha4usObjectActionType = 'edit' | 'delete' | 'watch' | 'add_child'
export interface Ha4usObjectAction {
  type: Ha4usObjectActionType
  source: ObjectComponent
  object: Ha4usObject
}
@Component({
  selector: 'ha4us-object',
  templateUrl: './object.component.html',
  styleUrls: ['./object.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectComponent {
  @Input() object: Ha4usObject
  @Input() alt: string

  @Output() action = new EventEmitter<Ha4usObjectAction>()

  constructor(protected cs: ClipboardService) {}

  copy(topicPath: string, event: any) {
    this.cs.copy(topicPath)
  }

  add($event) {
    console.log('Adding Topic', $event)
    this.action.emit({
      type: 'add_child',
      source: this,
      object: {
        topic: $event,
        type: undefined,
        can: {
          read: false,
          trigger: false,
          write: false,
        },
        tags: [...this.object.tags],
        native: {},
      },
    })
  }

  emitAction(action: Ha4usObjectActionType, event: MouseEvent) {
    this.action.emit({
      type: action,
      source: this,
      object: this.object,
    })
  }
}
