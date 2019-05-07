import * as io from 'socket.io-client'
import {
  MqttClient,
  ISubscriptionGrant,
  PacketCallback,
  IClientSubscribeOptions,
  ClientSubscribeCallback,
  IClientPublishOptions,
} from '@ha4us/core'
import { EventEmitter } from 'events'

import { Observable, fromEvent, of } from 'rxjs'
import { take, map, tap } from 'rxjs/operators'

import Debug from 'debug'
const debug = Debug('ha4us:gui:state:ioclient')

export class IOClient extends EventEmitter implements MqttClient {
  private io: SocketIOClient.Socket = null

  constructor() {
    super()
    this.io = io.connect({
      autoConnect: false,
    })

    this.setMaxListeners(50)

    /*this.io.on('connect', () => {
      debug('CONNECTED TO IO', this.io.io.engine.transport.name)
    })*/

    this.io.on('disconnect', msg => {
      debug('Disconnected from IO', msg)
    })

    this.io.on('message', (...args) => {
      this.emit('message', ...args)
    })

    this.io.on('reconnect', (...args) => {
      debug('Reconnected')
    })
    this.io.on('connect_timeout', (...args) => {
      debug('connect_timeout')
    })
    this.io.on('reconnect_attempt', (...args) => {
      debug('reonccent_atempt')
    })
    this.io.on('reconnect_error', (...args) => {
      debug('reonccent_error')
    })
    this.io.on('reconnect_failed', (...args) => {
      debug('reonccent_failed')
    })
    this.io.on('error', (...args) => {
      debug('general error', ...args)
      this.io.disconnect()
    })
    this.io.on('connect_error', (...args) => {
      debug('connect error', ...args)
    })
  }

  get connected(): boolean {
    return this.io.connected
  }

  connect(): Observable<IOClient> {
    if (this.io.connected) {
      return of(this)
    } else {
      debug('Connecting...', this.connected, this.io)

      const retVal = fromEvent(this.io, 'connect').pipe(
        tap(() => debug('Connected')),
        take(1),
        map(() => this)
      )

      this.io.connect()
      return retVal
    }
  }

  reconnect(opts: any): MqttClient {
    this.connect()
    return this
  }

  subscribe(
    topic: string | string[],
    opts?: IClientSubscribeOptions,
    callback?: ClientSubscribeCallback
  ): this

  subscribe(
    topic: string,
    options?: { qos?: number },
    cb?: (err: any, grants: ISubscriptionGrant[]) => void
  ): MqttClient {
    this.connect()
      .pipe(
        map(socket => {
          debug('Subscribing', topic)
          this.io.emit('subscribe', topic, options, cb)
        }),
        take(1)
      )
      .subscribe()
    return this
  }
  unsubscribe(topic: string | string[], callback?: PacketCallback): this
  unsubscribe(topic: string | string[], callback?: PacketCallback): MqttClient {
    debug('Unsubscribing', topic)
    this.io.emit('unsubscribe', topic)
    return this
  }
  publish(
    topic: string,
    message: string | Buffer,
    options?: IClientPublishOptions,
    callback?: PacketCallback
  ): this {
    debug('Publishing', topic, message)
    this.io.emit('publish', topic, message, options)
    return this
  }
}
