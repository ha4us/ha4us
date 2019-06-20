import {
  Component,
  OnInit,
  Input,
  HostBinding,
  Optional,
  Self,
  ElementRef,
  OnDestroy,
  Host,
  ViewChild,
  forwardRef,
  Inject,
  SkipSelf,
} from '@angular/core'

import { MatFormFieldControl } from '@angular/material/form-field'
import { Subject } from 'rxjs'
import {
  NgControl,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
  NG_VALIDATORS,
} from '@angular/forms'
import { FocusMonitor } from '@angular/cdk/a11y'
import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { UsFormControl } from '@ulfalfa/ng-util'
import { YamlInputDirective } from '../../directives/yaml-input.directive'
import { directiveDef } from '@angular/core/src/view'
@Component({
  selector: 'ha4us-yaml-input',
  templateUrl: './yaml-input.component.html',
  styleUrls: ['./yaml-input.component.scss'],
  providers: [],
})
@UsFormControl('yaml')
export class YamlInputComponent implements OnInit, ControlValueAccessor {
  @Input() required: boolean
  @Input() disabled = false
  @Input() placeholder

  formControl: FormControl

  @ViewChild(YamlInputDirective) yid: YamlInputDirective

  constructor(protected ngControl: NgControl) {
    if (ngControl) {
      ngControl.valueAccessor = this
    }
  }

  ngOnInit() {
    this.formControl = this.ngControl.control as FormControl
  }

  public writeValue(value: string) {}
  public registerOnChange(fn: any) {}
  public registerOnTouched(fn) {}
}
