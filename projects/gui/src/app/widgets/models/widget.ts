import { Type } from '@angular/core'
import { DynamicFormControl, DynamicForm } from '@ulfalfa/ng-util'

export interface WidgetPropertyDescription extends DynamicForm {
  default?: any
}

export interface Ha4usWidgetInterface {
  setConfig?(config: object): void
}

export const DEFAULT_WIDGET_DEFINITION: Partial<Ha4usWidgetDefinition> = {
  props: [],
}
export interface Ha4usWidgetDefinition {
  selector: string
  label: string
  library?: string
  props?: WidgetPropertyDescription
  config?: object
  defaults?: object
  height?: number
  width?: number
}

export interface WidgetLibEntry extends Ha4usWidgetDefinition {
  name: string
  widget: Type<any>
  regexp: RegExp
  level: number
}

export interface Ha4usWidgetLib {
  name: string
  widgets: Type<any>[]
}
