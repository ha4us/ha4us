import { InjectionToken } from '@angular/core'
import { defaultsDeep } from 'ha4us/core'

import { Type } from '@angular/core'
import {
    DEFAULT_WIDGET_DEFINITION,
    Ha4usWidgetDefinition,
    WidgetPropertyDescription,
} from './widget'

export const HA4US_WIDGETS: InjectionToken<any[]> = new InjectionToken(
    'Ha4usWidgets'
)


export const METADATA_KEY = '___ha4us-widget___'

export function Ha4usWidget<T extends Type<T>>(
    widgetDefinition: Ha4usWidgetDefinition
): any {
    type Ctor = Type<T>
    widgetDefinition = defaultsDeep(widgetDefinition, DEFAULT_WIDGET_DEFINITION)
    return (target: T): Ctor => {
        // most important part: setting the widgetDefinition
        Reflect.set(target, METADATA_KEY, widgetDefinition)

        // Return decorated constructor
        return target
    }
}
