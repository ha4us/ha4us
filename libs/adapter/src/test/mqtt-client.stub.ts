import { MqttClient } from '@ha4us/core'
import { EventEmitter } from 'events'

import * as Debug from 'debug'
import {
  IClientSubscribeOptions,
  ClientSubscribeCallback,
  IClientPublishOptions,
  PacketCallback,
} from 'mqtt'
const debug = Debug('ha4ustest.stub')

export class MqttClientStub extends EventEmitter implements MqttClient {
  readonly connected = true
  subscribe(
    topic: string | string[],
    opts: IClientSubscribeOptions,
    callback?: ClientSubscribeCallback
  ): this {
    debug('Subscribe', topic)
    const qos: number = opts && opts.qos ? opts.qos : 0
    if (callback) {
      callback(null, [{ topic: topic as string, qos }])
    }
    return this
  }
  unsubscribe(topic: string | string[], callback?: PacketCallback): this {
    debug('Unsubscribe', topic)

    if (callback) {
      callback(null, { cmd: 'unsubscribe', unsubscriptions: topic as string[] })
    }
    return this
  }
  publish(
    topic: string,
    message: string | Buffer,
    options?: IClientPublishOptions,
    callback?: PacketCallback
  ): this {
    const buffered =
      typeof topic === 'string' && message !== null
        ? Buffer.from(message as string)
        : message
    const packet = {
      cmd: 'publish',
      qos: options.qos,
      dup: false,
      retain: options.retain,
      topic,
      payload: buffered,
    }
    this.emit('message', topic, buffered, packet)
    if (callback) {
      callback(null)
    }
    return this
  }

  reconnect() {
    return this
  }
}
