import {
  Component,
  Input,
  Output,
  Optional,
  Host,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  EventEmitter,
} from '@angular/core'
import {
  FormControl,
  FormGroup,
  Validators,
  FormBuilder,
  ControlContainer,
} from '@angular/forms'

import {
  DynamicFormGroup,
  DynamicFormControl,
  DynamicForm,
} from '../../models/forms'
import { FormbuilderService } from '../../services/formbuilder.service'
@Component({
  selector: 'us-form-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupComponent implements OnInit, OnChanges {
  @Input() control: DynamicFormGroup

  formGroup: FormGroup
  protected parentForm: FormGroup

  public _controls: DynamicForm = undefined

  constructor(
    protected fbs: FormbuilderService,
    @Optional() protected controlContainer: ControlContainer,
    protected cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.controlContainer) {
      throw new Error(`A us-dynamic-form must be in a control container`)
    }
    this.parentForm = this.controlContainer.control as FormGroup
    if (this.control.id && this.parentForm.contains(this.control.id)) {
      this.formGroup = this.parentForm.get(this.control.id) as FormGroup
    } else {
      this.formGroup = this.parentForm
    }

    this.addControls(this.control.controls)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.controls && !changes.controls.firstChange) {
      this.removeControls(changes.control.previousValue.controls)
      this.addControls(changes.control.currentValue.controls)
    }
  }

  protected removeControls(oldControls: DynamicForm) {
    if (oldControls) {
      this._controls = undefined
    }
  }

  protected addControls(newControls: DynamicForm) {
    if (newControls) {
      this._controls = newControls
      this.cdr.detectChanges()
    }
  }
}
