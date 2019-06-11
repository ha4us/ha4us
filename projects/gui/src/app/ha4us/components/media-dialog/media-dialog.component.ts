import { Component, Inject, OnInit, OnDestroy } from '@angular/core'

import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogConfig,
} from '@angular/material'
import { Subscription } from 'rxjs'
import { map, skip } from 'rxjs/operators'
import { Ha4usMedia } from '@ha4us/core'
import { MediaObserver } from '@angular/flex-layout'
export interface Ha4usMediaDialogData extends MatDialogConfig {
  media: Ha4usMedia
  mimeType: string
}

import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations'

@Component({
  selector: 'ha4us-media-dialog',
  templateUrl: './media-dialog.component.html',
  styleUrls: ['./media-dialog.component.scss'],
  animations: [
    trigger('stateSlider', [
      state('select', style({ transform: 'translateX(0)' })),
      state('upload', style({ transform: 'translateX(-50%)' })),
      transition('* => *', animate(300)),
    ]),
  ],
})
export class MediaDialogComponent implements OnInit, OnDestroy {
  protected _sub: Subscription

  cols: number
  state: 'upload' | 'select' = 'select'

  constructor(
    protected mediaObserver: MediaObserver,
    public dialogRef: MatDialogRef<MediaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Ha4usMediaDialogData
  ) {}

  ngOnInit() {
    this._sub = this.mediaObserver.media$
      .pipe(
        map(mc => {
          switch (mc.mqAlias) {
            case 'xs':
              return 1
            case 'sm':
              return 2
            case 'md':
              return 3
            default:
              return 4
          }
        })
      )
      .subscribe(cols => {
        this.cols = cols
      })
  }

  ngOnDestroy() {
    this._sub.unsubscribe()
  }

  public onSelect(media: Ha4usMedia) {
    if (media) {
      this.dialogRef.close({ media })
    }
  }
  public clearImage() {
    this.dialogRef.close({ media: { urn: undefined } })
  }

  public cancel() {
    if (this.state === 'select') {
      this.dialogRef.close()
    } else {
      this.state = 'select'
    }
  }
}
