import { Route } from '@angular/router'
export enum Ha4usPermission {
  ReadObjects = 100,
  AlterObjects,
  SubscribeStates = 200,
  GetStates,
  SetStates,
  ReadMedias = 300,
  AlterMedia,
  UploadMedia,
}

export interface Ha4usRoute extends Route {
  data?: {
    auth: Ha4usPermission[];
  }
}

export type Ha4usRoutes = Ha4usRoute[]
