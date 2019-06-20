import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { DOWN_ARROW } from '@angular/cdk/keycodes'
import {
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  OnDestroy,
  Optional,
  Output,
  HostBinding,
  HostListener,
  Self,
  SkipSelf,
} from '@angular/core'
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  ValidatorFn,
  Validators,
  NgControl,
} from '@angular/forms'

import { MatFormField } from '@angular/material/form-field'
import { MAT_INPUT_VALUE_ACCESSOR } from '@angular/material/input'
import { Subscription } from 'rxjs'

import { safeLoad, safeDump } from 'js-yaml'

/** Directive used to connect an input to a yaml parser. */
@Directive({
  // tslint:disable-next-line
  selector: 'textarea[usYaml]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => YamlInputDirective),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => YamlInputDirective),
      multi: true,
    },
    { provide: MAT_INPUT_VALUE_ACCESSOR, useExisting: YamlInputDirective },
  ],
  exportAs: 'usYaml',
})
export class YamlInputDirective
  implements ControlValueAccessor, OnDestroy, Validator {
  /** The value of the input. */
  @Input()
  get value(): object {
    return this._value
  }
  set value(value: object) {
    this._value = value
    this._formatValue(value)
  }

  /** Whether the yaml-input is disabled. */
  @HostBinding('disabled')
  @Input()
  get disabled(): boolean {
    return !!this._disabled
  }
  set disabled(value: boolean) {
    const newValue = coerceBooleanProperty(value)
    const element = this._elementRef.nativeElement

    if (this._disabled !== newValue) {
      this._disabled = newValue
      this._disabledChange.emit(newValue)
    }

    // We need to null check the `blur` method, because it's undefined during SSR.
    if (newValue && element.blur) {
      // Normally, native input elements automatically blur if they turn disabled. This behavior
      // is problematic, because it would mean that it triggers another change detection cycle,
      // which then causes a changed after checked error if the input element was focused before.
      element.blur()
    }
  }

  constructor(private _elementRef: ElementRef<HTMLInputElement>) {}
  private _value: object
  private _disabled: boolean

  /** Emits when the value changes (either due to user input or programmatic change). */
  _valueChange = new EventEmitter<object>()

  /** Emits when the disabled state has changed */
  _disabledChange = new EventEmitter<boolean>()

  /** Whether the last value set on the input was valid. */
  private _lastValueValid = false

  private _lastParseFailure: ValidationErrors | null = null

  /** The form control validator for whether the input parses. */

  private _parseValidator: ValidatorFn = (c): ValidationErrors | null => {
    return this._lastParseFailure
  }
  /** The combined form control validator for this input. */
  // tslint:disable-next-line
  private _validator: ValidatorFn | null = Validators.compose([
    this._parseValidator,
  ])

  _onTouched = () => {}

  private _cvaOnChange: (value: any) => void = () => {}

  private _validatorOnChange = () => {}

  ngOnDestroy() {
    this._valueChange.complete()
    this._disabledChange.complete()
  }

  /** @docs-private */
  registerOnValidatorChange(fn: () => void): void {
    this._validatorOnChange = fn
  }

  /** @docs-private */
  validate(c: AbstractControl): ValidationErrors | null {
    return this._validator ? this._validator(c) : null
  }

  // Implemented as part of ControlValueAccessor.
  writeValue(value: object): void {
    this.value = value
  }

  // Implemented as part of ControlValueAccessor.
  registerOnChange(fn: (value: any) => void): void {
    this._cvaOnChange = fn
  }

  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn
  }

  // Implemented as part of ControlValueAccessor.
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
  }
  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    let result: object

    try {
      result = safeLoad(value)
    } catch (e) {
      this._lastParseFailure = {
        yaml: {
          reason: e.reason,
          line: e.mark.line,
          column: e.mark.column,
          position: e.mark.position,
        },
      }
    } finally {
      if (typeof result === 'object') {
        this._lastParseFailure = null
        this._cvaOnChange(result)
        this._value = result
        this._valueChange.emit(result)
      } else {
        this._lastParseFailure = {
          yaml: {
            reason: 'invalid',
            line: 0,
            column: 0,
            position: 0,
          },
        }
      }

      this._validatorOnChange()
    }
  }

  /** Handles blur events on the input. */
  @HostListener('blur')
  _onBlur() {
    // Reformat the input only if we have a valid value.
    if (!this._lastParseFailure && this.value) {
      this._formatValue(this.value)
    }

    this._onTouched()
  }

  /** Formats a value and sets it on the input element. */
  private _formatValue(obj: object) {
    if (obj) {
      const value = safeDump(obj, { noRefs: true })
      this._elementRef.nativeElement.value = value
    } else {
      this._elementRef.nativeElement.value = ''
    }
  }
}
