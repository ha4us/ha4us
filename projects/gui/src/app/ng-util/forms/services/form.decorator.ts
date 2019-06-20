import { Type } from '@angular/core'

export const METADATA_KEY = '___us-form-control___'

export const PARAM_MATCH = /^([a-zA-Z-]{3,}){1}(?:\[(.+)\])?$/

export interface DynamicFormControlDescription {
  param: string
  value?: string
  component?: any
}

export function UsFormControl<T extends Type<T>>(par: string): any {
  type Ctor = Type<T>
  return (target: T): Ctor => {
    const match = PARAM_MATCH.exec(par)

    if (!match) {
      throw new Error(`Wrong parameter ${par} for FormControl ${target.name}`)
    }

    const [_, name, param] = match

    // most important part: setting the widgetDefinition
    Reflect.set(target, METADATA_KEY, { name, param })

    // Return decorated constructor
    return target
  }
}
