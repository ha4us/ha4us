import {
  Injectable,
  Inject,
  Type,
  Component,
  Optional,
  SkipSelf,
} from '@angular/core'

import cloneDeep from 'lodash/cloneDeep'

import { DynamicForm } from '@ulfalfa/ng-util'

import {
  HA4US_WIDGETS,
  METADATA_KEY,
  Ha4usWidgetDefinition,
  Ha4usWidgetLib,
  WidgetLibEntry,
} from './models'

const debug = require('debug')('ha4us:widgets:service')

@Injectable({ providedIn: 'root' })
export class WidgetService {
  private widgets: WidgetLibEntry[] = []
  private widgetDic: Map<string, WidgetLibEntry> = new Map()

  constructor(@Inject(HA4US_WIDGETS) widgets: Ha4usWidgetLib) {
    this.registerLibrary(widgets)

    this.widgets = this.widgets.sort(
      (infoa, infob) => infob.level - infoa.level
    )
    debug('Installed', this.widgets.map(info => info.widget.name))
  }

  registerWidget(widget: Type<any>, libraryName: string) {
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
      }
      this.widgets.push(info)
      this.widgetDic.set(info.name, info)
      debug(`Register widget ${info.name}`)
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
      const widget = this.getWidget('value')
      if (!widget) {
        throw new Error(`no widget '${selector}' installed`)
      }
      return widget
    }
  }

  getMeta(name: string): WidgetLibEntry {
    return cloneDeep(this.getWidget(name))
  }

  getWidgets(): WidgetLibEntry[] {
    return this.widgets
  }
}
