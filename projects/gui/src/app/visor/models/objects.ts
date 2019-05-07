import { Ha4usObject, MqttUtil } from 'ha4us/core'
import { VisorEntity, VisorId } from './container.model'
import { VisorConfig } from './config'

export const VISOR_OBJECT_PREFIX = 'ha4us/visor'

export class VisorObject extends Ha4usObject {
    can = {
        read: false,
        write: false,
        trigger: false,
    }
    native: VisorEntity

    static fromEntity(entity: VisorEntity) {
        const obj = new VisorObject(VisorObject.getTopic(entity.id))
        obj.native = entity
        return obj
    }

    static getTopic(entityId: VisorId) {
        return MqttUtil.join(VISOR_OBJECT_PREFIX, entityId)
    }
}

export class VisorConfigObject extends Ha4usObject {
    can = {
        read: false,
        write: false,
        trigger: false,
    }
    native: VisorConfig
}
