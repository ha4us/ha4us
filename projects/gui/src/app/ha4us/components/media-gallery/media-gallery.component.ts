import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core'
import { FormBuilder, FormGroup } from '@angular/forms'
import { Ha4usMedia } from '@ha4us/core'
import chunk from 'lodash/chunk'
import { Subscription } from 'rxjs'
import { map, debounceTime } from 'rxjs/operators'
import { MediaService } from '../../services/media.service'
import { MediaSearchEvent } from '@ha4us/ng/models'

@Component({
  selector: 'ha4us-media-gallery',
  templateUrl: './media-gallery.component.html',
  styleUrls: ['./media-gallery.component.scss'],
})
export class MediaGalleryComponent implements OnInit, OnDestroy {
  protected _sub: Subscription
  searchForm: FormGroup

  @Output() public select = new EventEmitter<Ha4usMedia>()

  @Input() public mimeType: string

  public _cols = 4
  @Input()
  public set cols(cols: number) {
    if (cols) {
      this._cols = cols
    }
  }

  public partialMime = false

  constructor(protected ms: MediaService, protected fb: FormBuilder) {
    this.searchForm = this.fb.group({
      mimeType: '*',
      tags: [[]],
      fileName: [],
    })
  }

  medias = this.ms.searchResult$.pipe(map(medias => chunk(medias, this._cols)))

  allTags = this.ms.allTags$

  ngOnInit() {
    this._sub = this.searchForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe(_ => {
        const search: MediaSearchEvent = this.searchForm.getRawValue()
        if (this.partialMime) {
          search.mimeType = [this.mimeType, search.mimeType].join('/')
        }
        this.ms.setSearch(search)
      })

    this.partialMime = this.mimeType && this.mimeType.indexOf('/') < 0

    if (this.mimeType) {
      if (this.partialMime) {
        this.searchForm.patchValue({
          mimeType: '*',
        })
      } else {
        this.searchForm.patchValue({
          mimeType: this.mimeType,
        })
        this.searchForm.get('mimeType').disable({ emitEvent: false })
      }
    }
  }

  ngOnDestroy() {
    this._sub.unsubscribe()
  }
}
