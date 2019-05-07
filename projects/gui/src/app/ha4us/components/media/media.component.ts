import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  HostBinding,
  HostListener,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core'

import { coerceBooleanProperty } from '@angular/cdk/coercion'

import { SafeHtml } from '@angular/platform-browser'

import { MediaService } from '../../services/media.service'

import { Ha4usMedia, Ha4usError } from '@ha4us/core'

import {
  Observable,
  of,
  Subject,
  never,
  NEVER,
  ReplaySubject,
  empty,
  EMPTY,
} from 'rxjs'
import { take, map, tap, mergeMap, filter } from 'rxjs/operators'

interface MediaData {
  url: string
  content?: Observable<SafeHtml>
  type: string
  urn?: string
}

const MEDIA_NOT_FOUND: MediaData = {
  url: '/assets/images/media_not_found.svg',
  type: 'image',
}
@Component({
  selector: 'ha4us-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss'],
})
export class MediaComponent implements OnInit, OnDestroy {
  mediaUrn$: ReplaySubject<string> = new ReplaySubject(1)

  media$: Observable<MediaData> = this.mediaUrn$.pipe(
    mergeMap(media => (media ? this.getMediaFromService(media) : of(undefined)))
  )

  public progress: number

  @Input()
  public set media(media: string) {
    this.mediaUrn$.next(media)
  }

  @Input()
  set size(val: number) {
    if (val) {
      this.width = val
      this.height = val
    }
  }

  protected _avatar: boolean
  @Input() set avatar(val: any) {
    this._avatar = coerceBooleanProperty(val)
  }
  get avatar(): any {
    return this._avatar
  }

  @Input() color: string
  @Input() set backgroundColor(color: string) {
    this.bgColor = color
  }
  get backgroundColor(): string {
    return this.bgColor
  }

  noMediaText: string
  @Input() set alt(val: string) {
    this.noMediaText = this.avatar ? this.generateInitials(val) : val
  }

  @Input() altImg: string

  @HostBinding('style.width.px') public width: number
  @HostBinding('style.height.px') public height: number
  @HostBinding('style.backgroundColor') public bgColor: string

  constructor(
    protected ms: MediaService,
    protected changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.mediaUrn$.complete()
  }

  getMediaFromService(urn: string) {
    return this.ms.getOne(urn).pipe(
      map(media => {
        if (!media) {
          if (this.altImg) {
            return {
              type: 'image',
              url: this.altImg,
            }
          } else {
            return MEDIA_NOT_FOUND
          }
        } else {
          const type = MediaService.getMainMime(media.contentType)
          const url = MediaService.getURL(media.urn)

          return {
            type,
            url,
            urn: media.urn,
            content: type === 'svg' ? this.ms.getHTML(media.urn) : NEVER,
          }
        }
      })
    )
  }

  generateInitials(name: string, size = 2) {
    name = name ? name.trim() : null

    if (!name) {
      return ''
    }

    const initials = name.split(' ')

    if (size && size < initials.length) {
      return this.constructInitials(initials.slice(0, size))
    } else {
      return this.constructInitials(initials)
    }
  }

  /**
   * Iterates a person's name string to get the initials of each word in uppercase.
   */
  constructInitials(elements: string[]): string {
    if (!elements || !elements.length) {
      return ''
    }

    return elements
      .filter(element => element && element.length > 0)
      .map(element => element[0].toUpperCase())
      .join('')
  }
}
