import {
  Component,
  OnInit,
  Input,
  Output,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  EventEmitter,
} from '@angular/core'
import {
  DomSanitizer,
  SafeUrl,
  SafeResourceUrl,
  SafeHtml,
} from '@angular/platform-browser'

import { MatButtonToggleChange } from '@angular/material'

import { MediaService } from '../../services/media.service'

import { Ha4usMedia } from '@ha4us/core'
import * as Cropper from 'cropperjs/dist/cropper'

import { bindCallback, of, Observable } from 'rxjs'
import { tap, filter, map, mergeMap } from 'rxjs/operators'

import { Subscription } from 'rxjs'

@Component({
  selector: 'ha4us-media-upload',
  templateUrl: './media-upload.component.html',
  styleUrls: ['./media-upload.component.scss'],
})
export class MediaUploadComponent implements OnInit, AfterViewInit, OnDestroy {
  public file: File = undefined

  protected cropper: Cropper

  public type: string
  public mediaSrc: SafeUrl
  public mediaContent: SafeHtml

  public uploadProgress: number
  public progress: number

  public dragIsValid: boolean

  public media: Partial<Ha4usMedia> = undefined

  public mimeFilter: string
  @Input()
  set mimeType(type: string) {
    if (type) {
      this.mimeFilter = type.indexOf('/') > -1 ? type : type + '/*'
    }
  }

  @Output() upload: EventEmitter<Ha4usMedia> = new EventEmitter()

  public get saveable(): boolean {
    return !!this.file && !!this.media
  }

  @ViewChild('croppingArea',{static:false})
  public set image(img: ElementRef) {
    if (img) {
      if (!this.cropper) {
        this.cropper = new Cropper(img.nativeElement, {
          autoCrop: false,
          dragMode: 'move',
          minCropBoxWidth: 40,
          minCropBoxHeight: 40,

          viewMode: 1,

          ready() {},
        })
      }
    }
  }

  constructor(protected ds: DomSanitizer, protected ms: MediaService) {}
  ngOnInit() {}

  ngAfterViewInit() {}

  ngOnDestroy() {}

  getDate() {
    return new Date()
  }

  public fileSelected(file: File) {
    this.file = file

    this.media = {
      filename: file.name,
      contentType: file.type,
      tags: [],
    }

    this.type = MediaService.getMainMime(file.type)

    this.mediaSrc = this.ds.bypassSecurityTrustResourceUrl(
      URL.createObjectURL(file)
    )

    if (this.cropper && this.type === 'image') {
      this.cropper.replace(this.mediaSrc, false)
    }
  }

  public changeCrop($event: MatButtonToggleChange) {
    if (this.cropper) {
      switch ($event.value) {
        case 'avatar':
          this.cropper.crop()
          this.cropper.setAspectRatio(1)
          break
        case 'crop':
          this.cropper.crop()
          this.cropper.setAspectRatio(0)
          break
        default:
          this.cropper.reset()
          this.cropper.clear()
      }
    }
  }

  public save() {
    let obs: Observable<File | Blob>
    if (this.type === 'image') {
      const canvas = this.cropper.getCroppedCanvas()
      const toBlob = bindCallback<Blob>(canvas.toBlob.bind(canvas))
      obs = toBlob()
    } else {
      obs = of(this.file)
    }

    obs
      .pipe(mergeMap(data => this.ms.upload(data, this.media)))
      .subscribe(data => this.upload.emit(data))
  }
}
