import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ComponentFactory,
  ComponentFactoryResolver,
  ViewContainerRef,
  Type,
} from '@angular/core'

import { WidgetService } from '../../widget.service'

@Component({
  selector: 'ha4us-widget',
  template: `
    <ng-template #placeholder></ng-template>
  `,
})
export class WidgetComponent implements OnInit {
  @Input() widget: string
  @Input() props: { [name: string]: any }

  @Input() library: string

  @ViewChild('placeholder', { read: ViewContainerRef })
  protected _vcr: ViewContainerRef

  protected componentRef: any

  constructor(
    protected componentFactoryResolver: ComponentFactoryResolver,
    protected ws: WidgetService
  ) {}

  ngOnInit() {
    if (!this.componentRef) {
      this.componentRef = this.renderWidget()
    }
  }

  renderWidget(): any {
    const widget = this.ws.findWidget(this.widget, this.library)

    const componentFactory: ComponentFactory<
      any
    > = this.componentFactoryResolver.resolveComponentFactory(widget.widget)
    // viewContainerRef.clear();
    const component = this._vcr.createComponent(componentFactory)
    widget.props.forEach(prop => {
      component.instance[prop.id] = this.props[prop.id] || prop['default']
    })
    return component
  }
}
