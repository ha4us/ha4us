import {
  IClientSubscribeOptions,
  IClientPublishOptions,
  ClientSubscribeCallback,
  PacketCallback,
} from 'mqtt'
export {
  IClientSubscribeOptions,
  IClientPublishOptions,
  ClientSubscribeCallback,
  IPacket,
  PacketCallback,
  ISubscriptionGrant,
} from 'mqtt'

type NodeEventHandler = (...args: any[]) => void

export class Ha4usMessage {
  /** the mqtt topic to which this message was published to */
  topic: string
  /** the if matched by the mqtt matcher here goes the data */
  match?: {
    pattern: string
    params: string[]
  }
  val: any
  ts: string
  old?: any
  lc?: string
  retain: boolean
}

export interface MqttMessage {
  /** the mqtt topic to which this message was published to */
  topic: string
  /** the payload */
  payload: Uint8Array
  /** the quality of service */
  qos: number
  /** if this message is a retained message */
  retain: boolean
  /** if this message is a dublicate */
  dup: boolean
}

export interface MqttClient {
  readonly connected: boolean
  subscribe(
    topic: string | string[],
    opts?: IClientSubscribeOptions,
    callback?: ClientSubscribeCallback
  ): this
  unsubscribe(topic: string | string[], callback?: PacketCallback): this
  publish(
    topic: string,
    message: string | Buffer,
    opts?: IClientPublishOptions,
    callback?: PacketCallback
  ): this

  reconnect(opts?: any): MqttClient

  addListener(eventName: string, handler: NodeEventHandler): void | {}
  removeListener(eventName: string, handler: NodeEventHandler): void | {}
}
