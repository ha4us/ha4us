import {
  Component,
  Input,
  OnInit,
  ViewChild,
  forwardRef,
  SkipSelf,
  Optional,
} from '@angular/core'
import {
  ControlValueAccessor,
  NgControl,
  NG_VALUE_ACCESSOR,
  FormControl,
} from '@angular/forms'
import { MatAutocompleteTrigger } from '@angular/material'
import { MqttUtil } from '@ha4us/core'
import { UsFormControl } from '@ulfalfa/ng-util'
import { Observable } from 'rxjs'
import { debounceTime, map, mergeMap, tap, filter } from 'rxjs/operators'
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

  @ViewChild(MatAutocompleteTrigger, { static: false })
  autoTopic: MatAutocompleteTrigger

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
      // filter(val => !!val),
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
