import { Pipe, PipeTransform } from '@angular/core'

import { MapService } from '../services/map.service'
import { ValueMap } from 'ha4us/core'

@Pipe({
    name: 'map',
    pure: false,
})
export class MapPipe implements PipeTransform {
    protected _currentMapName: string
    protected _currentMap: ValueMap<any, any>
    protected resultVal: any

    constructor(protected ms: MapService) {}

    transform(value: any, mapName: any): any {
        if (!mapName) {
            this.resultVal = value
            this._currentMap = undefined
        } else if (mapName !== this._currentMapName) {
            this._currentMapName = mapName
            const map = this.ms.get(mapName)
            if (map) {
                this._currentMap = map
                this.resultVal = this._currentMap.map(value)
            } else {
                this._currentMap = undefined
            }
        }
        if (this._currentMap) {
            this.resultVal = this._currentMap.map(value)
        }

        return this.resultVal
    }
}
