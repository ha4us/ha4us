import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
} from '@angular/core'

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { ESCAPE } from '@angular/cdk/keycodes'
import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { CdkPortal } from '@angular/cdk/portal'
import {
  Overlay,
  OverlayRef,
  OverlayKeyboardDispatcher,
} from '@angular/cdk/overlay'

import { merge } from 'rxjs'
import { take, filter } from 'rxjs/operators'

import { ColorEvent, Color, RGBA, toState } from 'ngx-color'

@Component({
  selector: 'ha4us-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ColorPickerComponent,
      multi: true,
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ColorPickerComponent implements OnInit, ControlValueAccessor {
  alpha: boolean
  @Input('alpha') set _alpha(val: any) {
    this.alpha = coerceBooleanProperty(val)
  }

  delete = false
  @Input('delete') set _delete(val: any) {
    this.delete = coerceBooleanProperty(val)
  }

  public colorStyle: string
  public color: Color
  @ViewChild(CdkPortal) protected picker: CdkPortal
  @ViewChild('anchor') protected anchor: ElementRef

  ovref: OverlayRef

  protected _onChange: (_any) => void
  protected _onTouched: (_any) => void

  constructor(
    protected overlay: Overlay,
    protected kbd: OverlayKeyboardDispatcher
  ) {}

  ngOnInit() {
    this.color = toState('white')
  }

  openPicker(event) {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.anchor)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetY: 10,
        },
      ])

    this.ovref = this.overlay.create({
      hasBackdrop: true,
      panelClass: 'ha4us-color-picker',
      positionStrategy,
    })
    this.ovref.attach(this.picker)

    merge(
      this.ovref.backdropClick(),
      this.ovref
        .keydownEvents()
        .pipe(filter(keyEvent => keyEvent.keyCode === ESCAPE))
    )
      .pipe(take(1))
      .subscribe(() => {
        this.ovref.dispose()
      })
  }

  handleChange(event: ColorEvent) {
    // this.color = event.color
    const rgba = event.color.rgb
    if (rgba.a !== 1) {
      this.colorStyle = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`
    } else {
      this.colorStyle = event.color.hex
    }
    if (this._onChange) {
      this._onChange(this.colorStyle)
    }
  }

  clear() {
    this.colorStyle = ''
    if (this._onChange) {
      this._onChange(undefined)
    }

    this.ovref.dispose()
  }

  ////////////////
  /// Control Value Accessor
  ///////////////
  public writeValue(value: any) {
    if (value) {
      this.color = toState(value)
      this.colorStyle = value
    }
  }

  public touch(value: any) {
    if (this._onTouched) {
      this._onTouched(value)
    }
  }

  public registerOnChange(fn: (_any) => void) {
    this._onChange = fn
  }

  public registerOnTouched(fn: (_any) => void) {
    this._onTouched = fn
  }
}
