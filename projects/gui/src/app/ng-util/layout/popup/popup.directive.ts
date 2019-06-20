import {
  Directive,
  OnInit,
  OnDestroy,
  Input,
  TemplateRef,
  ElementRef,
  HostListener,
} from '@angular/core'

import { ESCAPE } from '@angular/cdk/keycodes'
import { PortalDirective } from './popup-portal.directive'
import {
  Overlay,
  OverlayRef,
  OverlayKeyboardDispatcher,
  ConnectionPositionPair,
} from '@angular/cdk/overlay'

import { merge } from 'rxjs'
import { take, filter } from 'rxjs/operators'

const POSITION_REGEXP = /(after|before|center)\s?(above|below|center)?/
@Directive({
  selector: '[usPopupTrigger],[usPopup]',
  exportAs: 'usPopup',
})
export class PopupDirective implements OnInit, OnDestroy {
  protected ovref: OverlayRef

  protected portal: PortalDirective

  @Input()
  set usPopup(portal: PortalDirective) {
    this.setPortal(portal)
  }
  @Input()
  set usPopupTrigger(portal: PortalDirective) {
    this.setPortal(portal)
    if (portal) {
      this.trigger = true
    }
  }
  trigger = false

  @Input() position: string
  constructor(
    protected el: ElementRef,
    protected overlay: Overlay,
    protected kbd: OverlayKeyboardDispatcher
  ) {}

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.trigger) {
      // event.stopPropagation()
      this.open(event)
    }
  }

  setPortal(portal: PortalDirective) {
    if (portal) {
      this.portal = portal
      this.portal.close = this.close.bind(this)
    }
  }

  ngOnInit() {}

  createOverlay() {
    const position: ConnectionPositionPair = {
      originX: 'center',
      overlayX: 'center',
      originY: 'center',
      overlayY: 'center',
    }

    if (this.position) {
      let [, hor, vert]: string[] = this.position.match(POSITION_REGEXP)
      hor = hor || 'before'
      vert = vert || 'center'

      switch (hor) {
        case 'before':
          position.originX = 'start'
          position.overlayX = 'end'
          break
        case 'after':
          position.originX = 'end'
          position.overlayX = 'start'
          break
        default:
          position.originX = 'center'
          position.overlayX = 'center'
      }
      switch (vert) {
        case 'above':
          position.originY = 'top'
          position.overlayY = 'bottom'
          break
        case 'below':
          position.originY = 'bottom'
          position.overlayY = 'top'
          break
        default:
          position.originY = 'center'
          position.overlayY = 'center'
      }
    }
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.el)
      .withPositions([
        position,
        {
          originX: 'start',
          overlayX: 'end',
          originY: 'center',
          overlayY: 'center',
        },
        {
          originX: 'end',
          overlayX: 'start',
          originY: 'center',
          overlayY: 'center',
        },
        {
          originX: 'center',
          overlayX: 'center',
          originY: 'bottom',
          overlayY: 'top',
        },
        {
          originX: 'center',
          overlayX: 'center',
          originY: 'top',
          overlayY: 'bottom',
        },
      ])

    this.ovref = this.overlay.create({
      hasBackdrop: false,
      // panelClass: 'us-color-picker',
      positionStrategy,
    })
  }

  ngOnDestroy() {
    this.close(undefined)
  }

  open($event: any) {
    this.createOverlay()

    if (!this.ovref.hasAttached()) {
      this.ovref.attach(this.portal)

      merge(
        this.ovref.backdropClick(),
        this.ovref
          .keydownEvents()
          .pipe(filter(event => event.keyCode === ESCAPE))
      )
        .pipe(take(1))
        .subscribe(() => {
          this.close()
        })
    }
  }

  close($event?: any) {
    if (this.ovref) {
      if (this.ovref.hasAttached()) {
        this.ovref.detach()
      }
      this.ovref.dispose()
      this.ovref = null
    }
  }
}
