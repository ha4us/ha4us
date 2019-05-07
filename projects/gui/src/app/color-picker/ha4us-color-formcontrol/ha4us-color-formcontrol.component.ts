import { Component, Input, OnInit, Host } from '@angular/core'
import {
  AbstractControl,
  FormControl,
  ControlValueAccessor,
  ControlContainer,
  DefaultValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms'

import { Ha4usFormControl } from '@ulfalfa/ng-util'

@Component({
  selector: 'ha4us-ha4us-color-formcontrol',
  templateUrl: './ha4us-color-formcontrol.component.html',
  styleUrls: ['./ha4us-color-formcontrol.component.scss'],
})
@Ha4usFormControl('color')
export class Ha4usColorFormcontrolComponent implements OnInit {
  public _color: string

  @Input()
  public get color(): string {
    return this._color
  }
  public set color(aColor: string) {
    this._color = aColor
    if (this._onChange) {
      this._onChange(aColor)
    }
  }

  @Input() mimeType = '*'
  @Input() required: boolean
  @Input() disabled = false
  @Input() placeholder

  _onChange: (val: any) => any

  constructor(@Host() public formControl: NgControl) {
    if (this.formControl) {
      // Note: we provide the value accessor through here, instead of
      // the `providers` to avoid running into a circular import.
      this.formControl.valueAccessor = this
    }
  }

  ngOnInit() {}

  public writeValue(value: string) {
    this.color = value
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
