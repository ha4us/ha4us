import { uuid, randomString } from '@ha4us/core'
export enum VisorEntityType {
    'Container' = 'visor',
    'Widget' = 'widget',
    'Visor' = 'visor',
}
export type VisorId = string

export class VisorEntity {
    type = undefined
    id: VisorId
    constructor(
        public width?: number,
        public height?: number,
        public x?: number,
        public y?: number,
        public styles: any = {}
    ) {
        this.id = randomString(10)
    }
}

export class Visor extends VisorEntity {
    type = VisorEntityType.Visor

    children: VisorId[] = []

    constructor(
        public label: string,
        public width: number = 400,
        public height: number = 500
    ) {
        super(width, height)
    }
}
export class VisorWidget extends VisorEntity {
    type = VisorEntityType.Widget

    properties: {
        [name: string]: any
    } = {}

    constructor(
        public widgetName: string,
        width?: number,
        height?: number,
        x?: number,
        y?: number
    ) {
        super(width, height, x, y)
    }
}
