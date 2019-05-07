import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  AfterViewInit,
  OnDestroy,
  forwardRef,
  ViewChild,
  Optional,
  Host,
  Self,
  SkipSelf,
  ElementRef,
} from '@angular/core'
import {
  AbstractControl,
  FormControl,
  ControlValueAccessor,
  ControlContainer,
  DefaultValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms'
import {
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
  MatInput,
} from '@angular/material'

import { Observable, Subject } from 'rxjs'
import { tap, debounceTime, mergeMap, map, filter } from 'rxjs/operators'

import { SPACE } from '@angular/cdk/keycodes'

import { MqttUtil } from '@ha4us/core'

import { Ha4usFormControl } from '@ulfalfa/ng-util'

import { ObjectService } from '../../services/object.service'

export interface TopicHierarchie {
  topic: string
  children: TopicHierarchie[]
}
@Component({
  selector: 'ha4us-topic-input',
  templateUrl: 'topic-input.component.html',
  styleUrls: ['topic-input.component.scss'],
})
@Ha4usFormControl('topic')
export class TopicInputComponent
  implements OnInit, AfterViewInit, ControlValueAccessor, OnDestroy {
  public autoCompleteTopics: Observable<string[]>

  public _topic: string

  @Input()
  public get topic(): string {
    return this._topic
  }
  public set topic(aTopic: string) {
    if (aTopic) {
      this._topic = aTopic
      if (this._onChange) {
        this._onChange(aTopic)
      }
      this.valueChanges.next(aTopic)
    }
  }

  @ViewChild(MatAutocompleteTrigger) autoTopic: MatAutocompleteTrigger

  @Output() topicChange: EventEmitter<string> = new EventEmitter<string>()

  @Input() disabled = false
  @Input() placeholder
  @Input() required

  valueChanges = new Subject<string>()

  _onChange: (val: any) => any

  constructor(
    protected os: ObjectService,
    @Optional()
    @Host()
    public formControl: NgControl
  ) {
    if (this.formControl) {
      // Note: we provide the value accessor through here, instead of
      // the `providers` to avoid running into a circular import.
      this.formControl.valueAccessor = this
    }
  }

  ngOnInit() {
    this.autoCompleteTopics = this.valueChanges.pipe(
      debounceTime(500),
      mergeMap(topic => {
        const topicCount = MqttUtil.split(topic).length - 1

        return this.os.topicTree$.pipe(
          map(data => data[topicCount]),
          map(data => data.filter(autoTopic => autoTopic.indexOf(topic) > -1)),
          tap(data => {
            if (data.length > 0) {
              this.autoTopic.openPanel()
            }
          })
        )
      })
    )
  }
  selected(event: MatAutocompleteSelectedEvent, input: HTMLInputElement) {
    this.valueChanges.next(this.topic + '/')
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.valueChanges.complete()
  }

  public writeValue(value: string) {
    this.topic = value
  }
  public registerOnChange(fn: any) {
    this._onChange = fn
  }

  public registerOnTouched(fn) {}

  public setDisabledState(isDisabled: boolean) {}
}
