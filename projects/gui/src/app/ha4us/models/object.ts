import { Ha4usObjectDisplay } from '@ha4us/core'
export interface Ha4usRoleDefinition extends Ha4usObjectDisplay {
  selector: string
}

export interface IAllTagData {
  tag: string
  topics: string[]
  count: number
}
