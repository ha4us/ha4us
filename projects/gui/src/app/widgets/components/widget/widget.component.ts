import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ComponentFactory,
  ComponentFactoryResolver,
  ViewContainerRef,
  Type,
  OnChanges,
  SimpleChanges,
  ComponentRef,
  ChangeDetectorRef,
  InjectionToken,
} from '@angular/core'

import { WidgetService } from '../../widget.service'
import { WidgetLibEntry } from '@app/widgets/models'
import { ControlComponent } from '@ulfalfa/ng-util/forms/components/control/control.component'

import Debug from 'debug'

const debug = Debug('ha4us:widgets:widget')
@Component({
  selector: 'ha4us-widget',
  template: `
    <ng-template #placeholder></ng-template>
  `,
})
export class WidgetComponent implements OnInit, OnChanges {
  @Input() widget: string
  @Input() props: { [name: string]: any }
  @Input() library: string
  @Input() default: string

  @ViewChild('placeholder', { read: ViewContainerRef,static:false })
  protected viewContainerRef: ViewContainerRef
  protected currentComponent: ComponentRef<any>
  protected currentComponentFactory: ComponentFactory<any>
  protected currentWidgetDefinition: WidgetLibEntry

  protected currentCdr: ChangeDetectorRef

  constructor(
    protected componentFactoryResolver: ComponentFactoryResolver,
    protected ws: WidgetService
  ) {}

  ngOnInit() {}

  createComponent() {
    let widget = this.ws.findWidget(this.widget, this.library)
    if (typeof widget === 'undefined' && this.default) {
      widget = this.ws.findWidget(this.default)
    }
    if (widget) {
      this.currentComponentFactory = this.componentFactoryResolver.resolveComponentFactory(
        widget.widget
      )

      debug(`Creating Widget ${widget.name}`)
      this.currentWidgetDefinition = widget
      this.viewContainerRef.remove()
      this.currentComponent = this.viewContainerRef.createComponent(
        this.currentComponentFactory
      )
      this.currentCdr = this.currentComponent.injector.get(
        ChangeDetectorRef as Type<ChangeDetectorRef>
      )
    }
  }

  setComponentParameter() {
    /*debug(
      `Setting property for ${this.currentWidgetDefinition.props
        .map(prop => prop.id)
        .join(',')}`
    )
    debug(
      `Inputs are  ${this.currentComponentFactory.inputs
        .map(prop => prop.propName)
        .join(',')}`
    )*/

    if (this.props) {
      this.currentWidgetDefinition.props.forEach(prop => {
        // tslint:disable-next-line

        this.currentComponent.instance[prop.id] =
          this.props[prop.id] || (prop as any).default
      })
    }
    this.currentCdr.detectChanges()
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    // Add '${implements OnChanges}' to the class.

    if (changes.library || changes.widget) {
      this.createComponent()
    }

    if (changes.props) {
      this.setComponentParameter()
    }
  }
}
