import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core'

import { FormControl, AbstractControl, Validators } from '@angular/forms'
import { coerceBooleanProperty } from '@angular/cdk/coercion'

import { Subject, Subscription, of } from 'rxjs'
import { map, tap, first, filter } from 'rxjs/operators'

import { ObjectService } from '../../services/object.service'

import { MqttUtil } from 'ha4us/core'

const debug = require('debug')('ha4us:gui:object:new-topic')
@Component({
  selector: 'ha4us-new-topic',
  templateUrl: './new-topic.component.html',
  styleUrls: ['./new-topic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewTopicComponent implements OnInit, OnChanges {
  topicPrefix: string
  topicVariable: string
  @Input() topic: string
  @Input() fixed: number

  @Input() showFixed: boolean

  @Output() topicChange = new EventEmitter<string>()

  existingsTopic$ = this.os.topics$

  topicControl = new FormControl(
    '',
    [Validators.required, Validators.minLength(3), this.noPattern.bind(this)],
    [this.validateTopic.bind(this)]
  )

  topicChange$ = this.topicControl.valueChanges.pipe(
    filter(() => this.topicControl.valid),
    map(varTopic => MqttUtil.join(this.topicPrefix, varTopic))
  )

  constructor(protected os: ObjectService) {}

  ngOnInit() {
    this.showFixed = coerceBooleanProperty(this.showFixed)
  }

  ngOnChanges(change: SimpleChanges) {
    if ((change.topic || change.fixed) && (this.topic && this.fixed)) {
      this.topicVariable = MqttUtil.slice(this.topic, this.fixed)
      this.topicPrefix = MqttUtil.slice(this.topic, 0, this.fixed)
      this.topicControl.setValue(this.topicVariable)
    }
  }

  validateTopic(control: AbstractControl) {
    const newTopic = this.topicPrefix
      ? MqttUtil.join(this.topicPrefix, control.value)
      : control.value

    return this.existingsTopic$.pipe(
      first(),

      map((topics: string[]) => {
        return topics.findIndex(topic => topic === newTopic)
      }),

      map(found => (found > 0 ? { topicExists: true } : null))
    )
  }

  noPattern(control: AbstractControl) {
    const newTopic = this.topicPrefix
      ? MqttUtil.join(this.topicPrefix, control.value)
      : control.value

    return MqttUtil.validTopic(newTopic) ? null : { invalidTopic: true }
  }

  onEnter() {
    if (this.topicControl.valid) {
      const newTopic = this.topicPrefix
        ? MqttUtil.join(this.topicPrefix, this.topicControl.value)
        : this.topicControl.value
      this.topicChange.emit(newTopic)
    }
  }
}
