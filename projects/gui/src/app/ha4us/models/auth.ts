import { Ha4usUser } from '@ha4us/core'

export interface AuthInfo {
    exp: number
    iat: number
    refresh: number
    user: Ha4usUser
    token?: string
}
