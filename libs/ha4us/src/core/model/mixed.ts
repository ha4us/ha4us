import { Ha4usMessage } from './state'
import { Ha4usObject } from './object'
export interface IStatefulObject {
    object: Ha4usObject
    state: Ha4usMessage
}
