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

import { UsFormControl } from '@ulfalfa/ng-util'

@Component({
  selector: 'ha4us-ha4us-media-formcontrol',
  templateUrl: './ha4us-media-formcontrol.component.html',
  styleUrls: ['./ha4us-media-formcontrol.component.scss'],
})
@UsFormControl('media[mimeType]')
export class Ha4usMediaFormcontrolComponent implements OnInit {
  public _media: string

  @Input()
  public get media(): string {
    return this._media
  }
  public set media(aMedia: string) {
    this._media = aMedia
    if (this._onChange) {
      this._onChange(aMedia)
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
    this.media = value
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
