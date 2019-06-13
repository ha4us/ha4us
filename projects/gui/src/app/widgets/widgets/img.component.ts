import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
} from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { StatesService } from '@ha4us/ng'
import { Subscription } from 'rxjs'
import { Ha4usWidget } from '../models'

@Component({
  selector: 'ha4us-img',
  template: `
    <img [src]="src || '/assets/images/Sonos_Default_AlbumArt.png'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    'img {width:100%;object-fit: cover;overflow:hidden;vertical-align: middle;}',
  ],
})
@Ha4usWidget({
  selector: 'Media/Coverart',
  library: 'complex',
  label: 'Cover',
  height: 100,
  width: 60,
  props: [
    {
      id: 'topic',
      type: 'topic',
      label: 'Topic',
      required: false,
    },
  ],
})
export class ImgComponent implements OnDestroy {
  protected sub: Subscription

  protected lastVal: string

  src: SafeResourceUrl
  @Input() set topic(topic: string) {
    if (topic) {
      this.ngOnDestroy()
      this.sub = this.states.observe(topic).subscribe(msg => {
        if (msg.val && msg.val !== this.lastVal) {
          this.lastVal = msg.val

          this.src = this.ds.bypassSecurityTrustResourceUrl(msg.val)
          this.cdr.markForCheck()
        }
      })
    } else {
      this.src = undefined
      this.lastVal = undefined
    }
  }

  constructor(
    protected states: StatesService,
    protected ds: DomSanitizer,
    protected cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe()
    }
  }
}
