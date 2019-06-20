export enum DynamicControlType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Select = 'select',
  Map = 'Map',
  Color = 'color',
  Image = 'image',
  SVG = 'image/svg',
}

export type DynamicControlGroupType = 'group'
export type DynamicControlArrayType = 'array'

export interface DynamicFormElement {
  type: string
  placeholder?: string
}

export interface DynamicFormControl extends DynamicFormElement {
  id: string // relative path to control
  required?: boolean
  min?: number
  max?: number
  values?: string[]
  default?: any
  flex?: number
  [addProp: string]: any
}

export interface DynamicFormGroup extends DynamicFormElement {
  id?: string
  expandable?: boolean
  type: DynamicControlGroupType
  controls: DynamicForm
}

export interface DynamicFormArray extends DynamicFormElement {
  id: string
  type: DynamicControlArrayType
  min?: number
  max?: number
  controls: DynamicFormControl[]
}

export type DynamicForm = (
  | DynamicFormControl
  | DynamicFormGroup
  | DynamicFormArray)[]
