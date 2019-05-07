import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core'
import { FormGroup, FormControl } from '@angular/forms'
import {
  Observable,
  Subject,
  ReplaySubject,
  Subscription,
  combineLatest,
  of,
} from 'rxjs'
import {
  filter,
  distinctUntilKeyChanged,
  switchMap,
  delay,
  takeUntil,
  take,
  debounceTime,
} from 'rxjs/operators'

import { FormbuilderService } from '@ulfalfa/ng-util'
import {
  Visor,
  VisorEntityType,
  VisorWidget,
  VisorEntity,
  VisorId,
  WidgetFormDefinition,
} from '../../models'

import { VisorService } from '@app/visor/services/visor.service'
import { WidgetService } from '@app/widgets'
@Component({
  selector: 'ha4us-widget-edit',
  templateUrl: './widget-edit.component.html',
  styleUrls: ['./widget-edit.component.scss'],
})
export class WidgetEditComponent implements OnInit, OnDestroy {
  controls: WidgetFormDefinition = []
  current: ReplaySubject<VisorEntity> = new ReplaySubject(1)
  type: VisorEntityType

  form: FormGroup = new FormGroup({ properties: new FormGroup({}) })

  protected stopForm = new Subject()

  @Input()
  set entity(entity: VisorEntity) {
    this.current.next(entity)
  }

  @Output()
  change = new EventEmitter<{ id: VisorId; changes: Partial<VisorEntity> }>()

  protected sub: Subscription
  constructor(
    protected ws: WidgetService,
    protected vs: VisorService,
    protected fbs: FormbuilderService
  ) {}

  getForms(entity: VisorEntity): WidgetFormDefinition {
    if (entity.type === VisorEntityType.Visor) {
      return this.vs.getCommonControls()
    } else {
      const def = this.ws.getMeta((entity as VisorWidget).widgetName)
      return [
        ...this.vs.getCommonControls(),
        {
          type: 'group',
          label: 'Eigenschaften',
          id: 'properties',
          expandable: true,

          controls: def.props,
        },
      ]
    }
  }

  ngOnInit() {
    this.sub = this.current
      .pipe(
        filter(val => !!val),
        distinctUntilKeyChanged('id'),
        switchMap(entity => {
          // stop form listening, that we do no receive updates from patching the values
          this.stopForm.next()

          this.type = entity.type

          this.controls = undefined
          const newControls = this.getForms(entity)
          this.form = this.fbs.form(newControls, null, entity)

          this.controls = newControls

          return this.current
        }),
        // technical delay, that we do not get the new widgets value with the old form listener
        delay(1),
        switchMap(entity => {
          return combineLatest(of(entity), this.form.valueChanges).pipe(
            takeUntil(this.stopForm)
          )
        })
      )
      .subscribe(val => {
        this.change.emit({ id: val[0].id, changes: val[1] })
      })
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }
}
