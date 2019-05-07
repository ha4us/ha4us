import { Component, Input } from '@angular/core'
import { Location } from '@angular/common'
import { AppService } from '../../services/app.service'
import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { CoordinatesDirective } from 'ngx-color'
@Component({
  selector: 'ha4us-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  @Input() set shadow(val: any) {
    this._shadow = coerceBooleanProperty(val)
  }
  get shadow(): any {
    return this._shadow
  }
  @Input() set noShadow(val: any) {
    this._shadow = !coerceBooleanProperty(val)
  }
  _shadow = true

  @Input() set back(val: any) {
    this._back = coerceBooleanProperty(val)
  }
  _back = false

  constructor(protected as: AppService, protected location: Location) {}

  showMenu$ = this.as.showMenu$

  showMenu() {
    this.as.showMenu(true)
  }

  goBack() {
    this.location.back()
  }
}
