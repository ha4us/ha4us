import {
  Component,
  Input,
  Host,
  Optional,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  SkipSelf,
} from '@angular/core'
import {
  ControlContainer,
  FormControl,
  FormGroupDirective,
  NgForm,
  FormGroup,
  Validators,
  NgControl,
} from '@angular/forms'

import { ErrorStateMatcher } from '@angular/material'

import { DynamicFormControl } from '../../models/forms'
import { FormbuilderService } from '../../services/formbuilder.service'
/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted
    // return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    return !!(control && control.invalid)
  }
}

@Component({
  selector: 'us-form-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ControlComponent implements OnInit, AfterViewInit {
  public control: DynamicFormControl
  @Input('control')
  set _control(newControl: DynamicFormControl) {
    this.control = newControl
    const form = this.controlContainer.control
    this.formControl = form.get(this.control.id) as FormControl

    this.cdr.detectChanges()
  }
  get _control(): DynamicFormControl {
    return this.control
  }

  errorStateMatcher = new MyErrorStateMatcher()

  formControl: FormControl

  constructor(
    private cdr: ChangeDetectorRef,
    @Optional() @SkipSelf() protected controlContainer: ControlContainer
  ) {}

  ngOnInit() {
    if (!this.controlContainer) {
      throw new Error(`A us-dynamic-control must be in a control container`)
    }
    this.cdr.detectChanges()
  }

  ngAfterViewInit() {}
}
