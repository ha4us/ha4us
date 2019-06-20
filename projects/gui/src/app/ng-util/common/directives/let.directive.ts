import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core'

interface UsLetContext {
  $implicit: any
  usLet: any
}

@Directive({
  selector: '[usLet]',
})
export class UsLetDirective {
  @Input()
  set usLet(value: any) {
    this.viewContainerRef.clear()
    this.viewContainerRef.createEmbeddedView(this.templateRef, {
      $implicit: value,
      usLet: value,
    })
  }

  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<UsLetContext>
  ) {}
}
