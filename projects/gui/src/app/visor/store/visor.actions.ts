import { Ha4usAction } from '@ha4us/ng'
import { Action as NgRxAction } from '@ngrx/store'
import { VisorEntity, VisorId } from '../models'

import { Update } from '@ngrx/entity'

export interface AddComponentPayload {
  component: VisorEntity
  parent?: VisorId
}

export interface Action extends NgRxAction {
  readonly type: string
  id: VisorId
}

export enum Types {
  AddComponents = '[Visor] AddComponents',

  AddComponent = '[Visor] AddComponent',
  UpdateComponent = '[Visor] UpdateComponent',
  RemoveComponent = '[Visor] RemoveComponent',

  AddChild = '[Visor] AddChild',
  RemoveChild = '[Visor] RemoveChild',

  SetMain = '[Visor] SetMain',
  SetSelected = '[Visor] SetSelected',
  SetEditMode = '[Visor] SetEditMode',

  Load = '[Visor] Load',
  Loaded = '[Visor] Loaded',
  LoadFailed = '[Visor] LoadFailed',

  Save = '[Visor] Save',
  Saved = '[Visor] Saved',
  SaveFailed = '[Visor] SaveFailed',
}

export namespace Actions {
  export class Load implements Ha4usAction<void> {
    readonly type = Types.Load
    payload: any
    constructor() {}
  }

  export class LoadFailed implements Ha4usAction<string> {
    readonly type = Types.LoadFailed
    constructor(public payload: string) {}
  }

  export class Saved implements Ha4usAction<void> {
    readonly type = Types.Saved
    payload: any
    constructor() {}
  }
  export class SaveFailed implements Ha4usAction<string> {
    readonly type = Types.SaveFailed
    constructor(public payload: string) {}
  }
  export class Save implements Action {
    readonly type = Types.Save
    constructor(public id: VisorId) {}
  }
  export class AddComponent implements Ha4usAction<VisorEntity> {
    readonly type = Types.AddComponent
    constructor(public payload: VisorEntity) {}
  }

  export class AddComponents implements Ha4usAction<VisorEntity[]> {
    readonly type = Types.AddComponents
    constructor(public payload: VisorEntity[]) {}
  }
  export class Loaded implements Ha4usAction<VisorEntity[]> {
    readonly type = Types.Loaded
    constructor(public payload: VisorEntity[]) {}
  }

  export class UpdateComponent implements Action {
    readonly type = Types.UpdateComponent

    constructor(public id: VisorId, public changes: Partial<VisorEntity>) {}
  }

  export class RemoveComponent implements Action {
    readonly type = Types.RemoveComponent

    constructor(public id: VisorId) {}
  }

  export class SetMain implements Ha4usAction<VisorId> {
    readonly type = Types.SetMain
    constructor(public payload: VisorId) {}
  }

  export class SetSelected implements Ha4usAction<VisorId> {
    readonly type = Types.SetSelected
    constructor(public payload: VisorId) {}
  }
  export class SetEditMode implements Ha4usAction<boolean> {
    readonly type = Types.SetEditMode
    constructor(public payload: boolean) {}
  }

  export class AddChild implements Action {
    readonly type = Types.AddChild
    constructor(public id: VisorId, public child: VisorId) {}
  }

  export class RemoveChild implements Action {
    readonly type = Types.RemoveChild

    constructor(public id: VisorId, public child: VisorId) {}
  }

  export type Union =
    | AddComponent
    | AddComponents
    | RemoveComponent
    | AddChild
    | RemoveChild
    | UpdateComponent
    | SetMain
    | SetSelected
    | SetEditMode
    | Save
    | Saved
    | SaveFailed
    | Load
    | Loaded
    | LoadFailed
}
