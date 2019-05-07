import { Ha4usObject } from './object'
import { MqttUtil } from '../utility'

const CONFIG_TOPIC_SYSTEM = 'ha4us/config/system'
const CONFIG_TOPIC_USER_PREFIX = 'ha4us/config/user'

export class Ha4usConfigObject extends Ha4usObject {
    native: {
        user: string
        config: Ha4usConfig<any>
    }
    static getTopic(topic: string, user?: string) {
        if (user == undefined) {
            return MqttUtil.join(CONFIG_TOPIC_SYSTEM, topic)
        } else {
            return MqttUtil.join(CONFIG_TOPIC_USER_PREFIX, user, topic)
        }
    }
    constructor(config: Ha4usConfig<any>, user?: string) {
        super(Ha4usConfigObject.getTopic(config.topic, user))
        this.native = {
            user,
            config,
        }
    }
}

export interface Ha4usConfig<T> {
    topic: string
    type: string
    value: T
}
