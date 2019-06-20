import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core'

@Component({
  // tslint:disable-next-line
  selector: 'us-card-grid',
  template: '<ng-content select="us-card" ></ng-content>',
  styleUrls: ['./card-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardGridComponent {

  @Input() resolution = 2
  @Input() gap = 10

  @HostBinding('style.gridAutoRows')
  get gridAutoRows() {
    return `${this.resolution}px`
  }
  @HostBinding('style.gridGap')
  get gridGaps() {
    return `${this.gap}px`
  }

  height2rows(height: number) {
    return Math.ceil((height + this.gap) / (this.gap + this.resolution))
  }

}
