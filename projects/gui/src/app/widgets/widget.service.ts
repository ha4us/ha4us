import {
  Injectable,
  Inject,
  Type,
  Component,
  Optional,
  SkipSelf,
} from '@angular/core'

import cloneDeep from 'lodash/cloneDeep'
import groupBy from 'lodash/groupBy'

import { DynamicForm } from '@ulfalfa/ng-util'

import {
  HA4US_WIDGETS,
  METADATA_KEY,
  Ha4usWidgetDefinition,
  Ha4usWidgetLib,
  WidgetLibEntry,
} from './models'
import { ReplaySubject, Subject } from 'rxjs'
import { map, tap, share, shareReplay } from 'rxjs/operators'

const debug = require('debug')('ha4us:widgets:service')

@Injectable({ providedIn: 'root' })
export class WidgetService {
  widget$ = new ReplaySubject<WidgetLibEntry[]>(1)

  groupedWidget$ = this.widget$.pipe(
    tap(widgets => {
      debug('Widgets arrived', widgets)
    }),
    map(widgets => groupBy(widgets, widget => widget.library))
  )

  private widgets: WidgetLibEntry[] = []
  private widgetDic: Map<string, WidgetLibEntry> = new Map()

  constructor(@Inject(HA4US_WIDGETS) widgetSets: Ha4usWidgetLib[]) {
    widgetSets.forEach(widgetSet => {
      this.registerLibrary(widgetSet)
    })

    this.widgets = this.widgets.sort(
      (infoa, infob) => infob.level - infoa.level
    )
    debug(
      'Installed',
      this.widgets.map(info => `${info.library}:${info.selector}`)
    )

    this.widget$.next(this.widgets)
  }

  registerWidget(widget: Type<any>, library: string) {
    const definition: Ha4usWidgetDefinition = Reflect.get(widget, METADATA_KEY)
    if (definition) {
      const info: WidgetLibEntry = {
        name: definition.selector || definition.label,
        widget,
        ...definition,
        regexp: definition.selector
          ? new RegExp('^' + definition.selector + '.*', 'i')
          : undefined,
        level: definition.selector ? definition.selector.split('/').length : 0,
        library: definition.library || library,
      }
      this.widgets.push(info)
      this.widgetDic.set(info.name, info)

      debug(`Register widget ${info.name} in library ${info.library}`)
    } else {
      throw new Error('No metadata for ' + widget.name)
    }
  }

  registerLibrary(library: Ha4usWidgetLib) {
    library.widgets.forEach(widget => {
      this.registerWidget(widget, library.name)
    })
  }

  getWidget(name: string): WidgetLibEntry {
    return this.widgetDic.get(name)
  }

  findWidget(selector: string, library?: string): WidgetLibEntry {
    debug(`Finding ${selector} in library ${library}`)
    const retVal = this.widgets
      .filter(
        info =>
          info.regexp &&
          info.regexp.test(selector) &&
          (!library || info.library === library)
      )
      .sort((a, b) => b.level - a.level)
    if (retVal.length > 0) {
      if (retVal.length > 1) {
        debug(`${retVal.length} widgets found`, retVal)
      }
      return retVal[0]
    } else {
      debug(`Widget ${selector} not found in library ${library}`)
    }
  }

  getMeta(name: string): WidgetLibEntry {
    return cloneDeep(this.getWidget(name))
  }

  getWidgets(): WidgetLibEntry[] {
    return this.widgets
  }
}
