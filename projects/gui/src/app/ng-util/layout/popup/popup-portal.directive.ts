import { Directive, TemplateRef, ViewContainerRef } from '@angular/core'

import { TemplatePortal } from '@angular/cdk/portal'

@Directive({
  selector: '[usPortal],[portal]',
  exportAs: 'usPortal',
})
export class PortalDirective extends TemplatePortal {
  close: ($event: any) => void = event => {}
  constructor(
    templateRef: TemplateRef<any>,
    viewContainerRef: ViewContainerRef
  ) {
    super(templateRef, viewContainerRef)
  }
}
