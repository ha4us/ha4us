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

import { UsFormControl } from '@ulfalfa/ng-util'

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
@UsFormControl('topic')
export class TopicInputComponent implements OnInit, ControlValueAccessor {
  public autoCompleteTopics: Observable<string[]>

  @ViewChild(MatAutocompleteTrigger) autoTopic: MatAutocompleteTrigger

  @Input() disabled = false
  @Input() placeholder
  @Input() required

  constructor(protected os: ObjectService, public ngControl: NgControl) {
    if (ngControl) {
      ngControl.valueAccessor = this
    }
  }

  ngOnInit() {
    this.autoCompleteTopics = this.ngControl.control.valueChanges.pipe(
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

  // ** the real value accessor is the input in the template so here only fake for the injector */
  public writeValue(value: string) {}
  public registerOnChange(fn: any) {}
  public registerOnTouched(fn) {}
}
