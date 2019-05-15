export const HA4US_USER: Ha4usUser = {
  username: 'unnamed',
  password: 'secret',
  fullName: 'unnamed',
  roles: ['guest'],
  properties: {},
}

export type UserRole = 'admin' | 'guest' | 'user' | 'api'

export class Ha4usUser {
  _id?: any
  fullName?: string
  password?: string
  tokenExp?: number
  avatarUrn?: string
  properties?: { [key: string]: any } = {}

  constructor(public username: string, public roles: string[] = []) {}
}
