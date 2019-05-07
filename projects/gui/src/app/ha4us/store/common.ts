import { Action } from '@ngrx/store'
import { Ha4usError } from '@ha4us/core'
export class Ha4usAction<T = any> implements Action {
    readonly type: string
    constructor(public payload: T) {}
}

export interface Ha4usSuccessAction<T = any> extends Action {
    action: Ha4usAction<T>
}
export interface Ha4usFailureAction<T = any> extends Action {
    action: Ha4usAction<T>
    error: Ha4usError
}

export function createSimpleReducer<S>(type: string, initialState: S) {
    return (state = initialState, action: Ha4usAction<S>): S => {
        if (action.type === type) {
            return action.payload
        } else {
            return state
        }
    }
}
