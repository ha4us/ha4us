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
import { MatSelect } from '@angular/material/select'
import { FocusMonitor } from '@angular/cdk/a11y'
import { coerceBooleanProperty } from '@angular/cdk/coercion'

import { Observable, Subject } from 'rxjs'

import { VisorId, Visor } from '../../models'

import { UsFormControl } from '@ulfalfa/ng-util'

import { VisorService } from '../../services/visor.service'

@Component({
  selector: 'ha4us-visor-select',
  templateUrl: './visor-select.component.html',
  styleUrls: ['./visor-select.component.scss'],
})
@UsFormControl('visor')
export class VisorSelectComponent implements OnInit {
  visors: Observable<Visor[]>
  public value: string

  @Input()
  public get visor(): string {
    return this.value
  }
  public set visor(aVisor: string) {
    this.value = aVisor
    if (this._onChange) {
      this._onChange(aVisor)
    }
  }

  @Input() disabled = false
  @Input() placeholder
  @Input() required

  _onChange: (val: any) => any

  constructor(
    protected vs: VisorService,
    @Host() public formControl: NgControl
  ) {
    if (this.formControl) {
      // Note: we provide the value accessor through here, instead of
      // the `providers` to avoid running into a circular import.
      this.formControl.valueAccessor = this
    }
  }

  ngOnInit() {
    this.visors = this.vs.visors$

    this.formControl.control.setValue(this.value)
  }

  public writeValue(value: string) {
    this.value = value
  }
  public registerOnChange(fn: any) {
    this._onChange = fn
  }

  public registerOnTouched(fn) {
    /*this.input.registerOnTouched(fn)*/
  }

  public setDisabledState(isDisabled: boolean) {
    /*this.disabled = isDisabled
        this.input.setDisabledState(isDisabled)*/
  }
}
