import { Injectable } from '@angular/core'

import { ConfigService } from '@ha4us/ng'

import { MqttUtil, ValueMap, IValueMap, TValueOperator } from '@ha4us/core'
import { Ha4usError } from '@ha4us/core'

const MAP_PREFIX = 'maps'

export const MAP_OPERATORS: { op: TValueOperator }[] = [
    { op: '=' },
    { op: '!=' },
    { op: '>=' },
    { op: '<=' },
    { op: '<' },
    { op: '>' },
    { op: 'isBetween' },
    { op: 'contains' },
    { op: 'matches' },
]

@Injectable({
    providedIn: 'root',
})
export class MapService {
    constructor(protected cs: ConfigService) { }

    getAll(): ValueMap<any, any>[] {
        return this.cs
            .get<ValueMap<any, any>>(MqttUtil.join(MAP_PREFIX, '#'))
            .map(config => config.value)
    }

    public put(map: IValueMap<any, any>): void {
        this.cs.set(MqttUtil.join(MAP_PREFIX, map.name), map)
    }

    public get(name: string): ValueMap<any, any> {
        const map = this.cs.getOne<IValueMap<any, any>>(
            MqttUtil.join(MAP_PREFIX, name)
        )

        if (map) {
            return ValueMap.from(map)
        } else {
            return ValueMap.from({ name, ifthens: [] })
        }
    }

    public async delete(name: string): Promise<void> {
        this.cs.delete(MqttUtil.join(MAP_PREFIX, name))
    }

    /*public map(name: string, value: any): any {
        const map = this._maps.get(name)
        if (map) {
            return map.map(value)
        } else {
            return value
        }
    }*/
}
