import { Component, OnInit, OnDestroy } from '@angular/core'
import { Ha4usMedia } from 'ha4us/core'

import { Observable, Subscription } from 'rxjs'
import { filter, take } from 'rxjs/operators'

import { MediaService } from '@ha4us/ng'
@Component({
  selector: 'ha4us-media-editor',
  templateUrl: './media-editor.component.html',
  styleUrls: ['./media-editor.component.scss'],
})
export class MediaEditorComponent implements OnInit, OnDestroy {
  selectedMedia = this.ms.selectedMedia$

  mimeType: string

  constructor(protected ms: MediaService) {}

  ngOnInit() {}

  ngOnDestroy() {}

  updateMedia(media: Ha4usMedia) {
    this.ms.upsertOne(media)
  }

  onUpload(event) {
    // console.log('Finish with event')
    // console.log(event)
  }

  deleteSelected() {
    this.selectedMedia
      .pipe(take(1))
      .subscribe(media => this.ms.removeOne(media.urn))
  }

  onSelect(val: Ha4usMedia) {
    this.ms.select(val.urn)
  }
}
