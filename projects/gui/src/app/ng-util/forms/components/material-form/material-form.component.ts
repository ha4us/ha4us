import {
  Component,
  Optional,
  Host,
  Self,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core'
import {
  FormControl,
  FormGroup,
  Validators,
  FormBuilder,
  ControlContainer,
} from '@angular/forms'

import { ReplaySubject, Subscription } from 'rxjs'

import { DynamicForm, DynamicFormGroup } from '../../models/forms'
import { FormbuilderService } from '../../services/formbuilder.service'
import Debug from 'debug'
import { startWith } from 'rxjs/operators'
const debug = Debug('ha4us:material:form')

@Component({
  selector: 'us-material-form',
  templateUrl: './material-form.component.html',
  styleUrls: ['./material-form.component.scss'],
  exportAs: 'ha4usMatForm',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaterialFormComponent implements OnInit, OnDestroy {
  protected sub: Subscription
  _controls: DynamicFormGroup[]
  @Input()
  set controls(val: DynamicFormGroup[]) {
    if (val && val.length > 0) {
      this._controls = val
      if (this.controlContainer && this.controlContainer.control) {
        this.form = this.controlContainer.control as FormGroup
      } else {
        this.form = this.fbs.form(val)
      }
    }
  }

  @Input() value: any

  @Output() valueChange = new EventEmitter<any>()

  _form: FormGroup
  @Input() set form(val: FormGroup) {
    if (val) {
      this._form = val
      if (this.value) {
        this.form.patchValue(this.value)
      }
      this.formChange.next(this._form)
      this.ngOnDestroy()

      this.sub = this._form.valueChanges
        .pipe(startWith(this._form.value))
        .subscribe(this.valueChange)
    }
  }
  get form(): FormGroup {
    return this._form
  }

  @Output() formChange = new EventEmitter<FormGroup>()

  constructor(
    @Self() @Optional() protected controlContainer: ControlContainer,
    protected fbs: FormbuilderService
  ) {}

  ngOnInit(): void {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    if (this.form && this.value) {
      this.form.patchValue(this.value)
    }
  }
  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    if (this.sub) {
      this.sub.unsubscribe()
    }
  }
}
