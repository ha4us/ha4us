import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ComponentFactory,
  ComponentFactoryResolver,
  ViewContainerRef,
} from '@angular/core'

import { Observable } from 'rxjs'
import { map, take } from 'rxjs/operators'
import { Store, select } from '@ngrx/store'
import { Update } from '@ngrx/entity'

import {
  Visor,
  VisorEntityType,
  VisorWidget,
  VisorEntity,
  VisorId,
} from '../../models'

import { AbstractVisorEntity } from '../abstract-visor-entity.component'

import { WidgetService } from '@app/widgets'
import { VisorService } from '../../services/visor.service'
@Component({
  selector: 'ha4us-visor-widget',
  templateUrl: './visor-widget.component.html',
  styleUrls: ['./visor-widget.component.scss'],
})
export class VisorWidgetComponent extends AbstractVisorEntity
  implements OnInit {
  @Input('id')
  set _id(val: VisorId) {
    if (val) {
      this.id = val
      this.id$.next(val)
    }
  }
  @ViewChild('anchor', /* TODO: add static flag */ { static:false,read: ViewContainerRef })
  _vcr: ViewContainerRef

  public config: Observable<VisorWidget>
  public componentRef: any
  constructor(
    protected componentFactoryResolver: ComponentFactoryResolver,
    protected ws: WidgetService,
    vs: VisorService
  ) {
    super(vs)
  }

  ngOnInit() {
    super.ngOnInit()
    this.sub.add(
      this.config.pipe().subscribe(widget => {
        if (!this.componentRef) {
          this.componentRef = this.renderWidget(widget)
        }
        if (widget) {
          Object.assign(this.componentRef.instance, widget.properties)
        }
      })
    )
  }

  renderWidget(widget: VisorWidget): any {
    const component = this.ws.getWidget(widget.widgetName)
    if (!component) {
      throw new Error(`no widget '${widget.widgetName}' installed`)
    }

    const componentFactory: ComponentFactory<
      any
    > = this.componentFactoryResolver.resolveComponentFactory(component.widget)

    // viewContainerRef.clear();
    return this._vcr.createComponent(componentFactory)
  }

  drop(event) {}
}
