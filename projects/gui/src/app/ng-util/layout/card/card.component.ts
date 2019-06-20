import { ChangeDetectorRef, Component, ElementRef, HostBinding, ViewChild, Host, DoCheck } from '@angular/core'
import { CardGridComponent } from '../card-grid/card-grid.component'
@Component({
  // tslint:disable-next-line
  selector: 'us-card',
  template: '<div #card><ng-content></ng-content></div>'
})
export class CardComponent implements DoCheck {

  constructor(private _element: ElementRef<HTMLElement>, protected cdr: ChangeDetectorRef, @Host() protected parent: CardGridComponent) { }

  lastHeight = 0
  @ViewChild('card') card: ElementRef<HTMLElement>

  @HostBinding('style.gridRowEnd') gridRowEnd: string

  ngDoCheck(): void {
    if (!this.lastHeight || this.lastHeight !== this.card.nativeElement.clientHeight) {
      this.lastHeight = this.card.nativeElement.clientHeight
      this.gridRowEnd = `span ${this.parent.height2rows(this.lastHeight)}`
    }

  }


}
