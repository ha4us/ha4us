import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { CLIPBOARD_SERVICE_PROVIDER } from './services/clipboard.service'

import { CssDirective } from './directives/css.directive'

import { SanitizePipe } from './pipes/sanitize.pipe'
import { UsLetDirective } from './directives/let.directive'

@NgModule({
  imports: [HttpClientModule, CommonModule],
  declarations: [CssDirective, SanitizePipe, UsLetDirective],
  exports: [CssDirective, SanitizePipe, UsLetDirective],
  entryComponents: [],
  providers: [CLIPBOARD_SERVICE_PROVIDER],
})
export class UsCommonModule {}
