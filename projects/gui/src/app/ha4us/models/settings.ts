export * from './default-settings'
import { Ha4usRoleDefinition } from './object'
export interface Ha4usGuiSettings {
  user: Ha4usGuiUserSettings
  browser: Ha4usGuiBrowserSettings
}

export interface Ha4usGuiUserSettings {
  roles: Ha4usRoleDefinition[]
  dashboard: {
    tags: string[];
  }
}

export interface Ha4usGuiBrowserSettings {
  id: string
}
