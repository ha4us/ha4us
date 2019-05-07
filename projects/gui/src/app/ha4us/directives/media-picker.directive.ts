import { Directive, OnInit, Input, Host, HostListener } from '@angular/core'

import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms'
import { mergeMap, tap, take } from 'rxjs/operators'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { MediaComponent } from '../components/media/media.component'

import {
  MediaDialogComponent,
  Ha4usMediaDialogData,
} from '../components/media-dialog/media-dialog.component'

const baseURL = '/api/media/'

@Directive({
  selector: 'ha4us-media [ha4usPick]',
  exportAs: 'ha4usPick',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MediaPickerDirective,
      multi: true,
    },
  ],
})
export class MediaPickerDirective implements ControlValueAccessor {
  protected _onChange: (_any) => void
  protected _onTouched: (_any) => void

  @Input() ha4usPick: string

  @HostListener('click', ['$event']) onClick($event) {
    this.pick($event)
  }
  constructor(
    protected ds: MatDialog,
    @Host() protected mediaComponent: MediaComponent
  ) {}

  public pick($event: any) {
    this.mediaComponent.mediaUrn$
      .pipe(
        take(1),
        mergeMap(media => {
          console.log('Media', media)
          const dialogRef: MatDialogRef<
            MediaDialogComponent,
            Ha4usMediaDialogData
          > = this.ds.open(MediaDialogComponent, {
            panelClass: 'responsive',
            maxWidth: '100vw',
            maxHeight: '100vh',
            height: '80vh',
            width: '80vw',
            data: { media, mimeType: this.ha4usPick },
          })
          return dialogRef.afterClosed()
        })
      )
      .subscribe(result => {
        if (result && result.media) {
          this.mediaComponent.mediaUrn$.next(result.media.urn)
          if (this._onChange) {
            this._onChange(result.media.urn)
          }
        }
      })
  }

  ////////////////
  /// Controll Value Accessor
  ///////////////
  public writeValue(value: any) {
    this.mediaComponent.mediaUrn$.next(value)
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
