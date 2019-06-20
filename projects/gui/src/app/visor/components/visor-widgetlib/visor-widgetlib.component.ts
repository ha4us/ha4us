import { Component, OnInit } from '@angular/core'

import { Subscription, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { WidgetService } from '@app/widgets/widget.service'
import { VisorWidget, VisorId } from '../../models'
import { VisorService } from '../../services/visor.service'
import { Ha4usWidgetDefinition, WidgetLibEntry } from '@app/widgets'
import { DropEvent } from '@ulfalfa/angular-draggable-droppable'

@Component({
  selector: 'ha4us-visor-widgetlib',
  templateUrl: './visor-widgetlib.component.html',
  styleUrls: ['./visor-widgetlib.component.scss'],
})
export class VisorWidgetlibComponent implements OnInit {
  public widgets: Ha4usWidgetDefinition[]

  constructor(protected vs: VisorService, protected ws: WidgetService) {}

  ngOnInit() {
    this.widgets = this.ws.getWidgets()
  }

  dragStart(coord: any) {
    //
  }

  dragEnd(coord: any) {
    //
  }

  toVisorWidget(item: WidgetLibEntry) {
    return this.vs.createVisorWidget(item)
  }
}
