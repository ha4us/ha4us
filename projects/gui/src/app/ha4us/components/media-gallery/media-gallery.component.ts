import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    Output,
    EventEmitter,
    ElementRef,
} from '@angular/core'
import { FormBuilder, FormGroup } from '@angular/forms'

import { MediaService } from '../../services/media.service'

import chunk from 'lodash/chunk'

import { Ha4usMedia } from '@ha4us/core'

import { Subject, Subscription, combineLatest, Observable } from 'rxjs'

import { debounceTime, startWith, tap, map } from 'rxjs/operators'

import { ngf } from 'angular-file'

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

    public mime = false

    constructor(
        protected ms: MediaService,
        protected fb: FormBuilder,
        protected el: ElementRef
    ) {
        this.searchForm = this.fb.group({
            mimeType: '*',
            tags: [[]],
            fileName: [],
        })
    }

    medias = this.ms.searchResult$.pipe(
        map(medias => chunk(medias, this._cols))
    )

    allTags = this.ms.allTags$

    ngOnInit() {
        this._sub = this.searchForm.valueChanges.subscribe(search => {
            console.log('SearchFormChanged', search)
            this.ms.setSearch(this.searchForm.getRawValue())
        })

        if (this.mimeType) {
            this.mime = this.mimeType.indexOf('/') > -1

            if (this.mime) {
                this.searchForm.get('mimeType').disable({ emitEvent: false })
            }
        }

        this.searchForm.patchValue({
            mimeType: !this.mime ? '*' : this.mimeType || '',
        })
    }

    ngOnDestroy() {
        this._sub.unsubscribe()
    }

    public isImage(item: Ha4usMedia): boolean {
        return MediaService.isMime(item, 'image')
    }
}
