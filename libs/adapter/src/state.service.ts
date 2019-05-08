import * as Mqtt from 'mqtt'

import { URL } from 'url'

import {
  Ha4usMessage,
  Ha4usLogger,
  MqttUtil,
  MqttService,
  get,
  isEqual,
} from '@ha4us/core'

import { ReplaySubject, Observable, of } from 'rxjs'
import {
  map,
  mergeMap,
  scan,
  shareReplay,
  take,
  distinct,
  timeoutWith,
} from 'rxjs/operators'

const debug = require('debug')('ha4us:adapter:stateservice')

export class StateService extends MqttService {
  public $log: Ha4usLogger
  protected mqtt: Mqtt.MqttClient
  protected cache: Map<string, Ha4usMessage>

  protected caching$: ReplaySubject<string>

  protected cache$: Observable<Map<string, Ha4usMessage>>

  constructor($args: { mqttUrl: string; name: string }, $log: Ha4usLogger) {
    const url = new URL($args.mqttUrl)
    $log.info(
      `Connecting to ${url.protocol}//${url.username}@${url.host} as ${
        $args.name
      }`
    )
    const mqtt = Mqtt.connect($args.mqttUrl, {
      clientId:
        $args.name +
        '_' +
        Math.random()
          .toString(16)
          .substr(2, 8),
      rejectUnauthorized: false,
      will: {
        topic: $args.name + '/connected',
        payload: '0',
        qos: 0,
        retain: true,
      },
    })

    mqtt.once('connect', () => {
      this.connected = 1
      this.$log.info('Connected as %s', mqtt.options.clientId)
    })
    mqtt.on('error', err => {
      $log.error('Error mqtt', err)
    })

    mqtt.on('close', () => {
      $log.warn('closing mqtt')
    })

    super(mqtt)

    this.mqtt = mqtt
    this.$log = $log
    this.caching$ = new ReplaySubject(1)

    this.cache$ = this.caching$.pipe(
      distinct(), // only add if not already in there
      mergeMap(topic => this.observe(topic)), // observe the new topic
      scan((acc: Map<string, Ha4usMessage>, msg: Ha4usMessage) => {
        acc.set(msg.topic, msg)
        return acc
      }, new Map<string, Ha4usMessage>()),
      shareReplay()
    )

    this.cache$.subscribe(cache => {
      debug(`cache updated ( size: ${cache.size})`)
      this.cache = cache
    })

    this.domain = $args.name
  }
  /**
   * setting connected status (emits via mqtt)
   *
   */
  set connected(value: number) {
    this.publish(this.domain + '/connected', value, { qos: 0, retain: true })
  }

  /**
   * initializes the cache by subscribing topic - each message is stored internally
   * @method establishCache
   * @param      topic pattern to subscribe
   */
  public establishCache(topic: string): Observable<Map<string, Ha4usMessage>> {
    this.caching$.next(topic)

    return this.cache$.pipe(
      take(1),
      timeoutWith(500, of(new Map<string, Ha4usMessage>()))
    )
  }
  // TODO: implement path logic
  public getCached(topic: string, path: string = null): any {
    const message = this.cache.get(
      MqttUtil.resolve(topic, 'status', this.domain)
    )
    if (message) {
      return get(message.val, path)
    } else {
      return undefined
    }
  }
  public getValue(topic: string): any {
    return this.getCached(topic, 'val')
  }
  /**
   * emits a ha4us status without any historic information
   *
   * @param topic the topic to emit the status
   * @param value the value to be emitted
   * @param retain flags, whether the message is retained
   */
  emit(topic: string, value: any, retain: boolean): Promise<Ha4usMessage> {
    const updatedTopic = MqttUtil.resolve(topic, 'status', this.domain)
    const message: Partial<Ha4usMessage> = {
      val: value,
      ts: new Date().toISOString(),
    }
    return this.publish(updatedTopic, message, { retain, qos: 0 }).then(() => {
      message.topic = updatedTopic
      return message as Ha4usMessage
    })
  }

  /**
   * emits a ha4us status
   * the value is always wrapped in a standarized ha4us message structure
   * and resolved with cached info (s. createCache)
   * @method status
   * @param    topic  the topic of the item (w/o /status/)
   * @param      value  value to emit
   * @param  retain retain message?
   * @return the published message
   */
  public status(
    topic: string,
    value: any,
    retain: boolean
  ): Promise<Ha4usMessage> {
    const updatedTopic = MqttUtil.resolve(topic, 'status', this.domain)

    const message: Partial<Ha4usMessage> = {
      val: value,
      ts: new Date().toISOString(),
    }

    return this.establishCache(topic)
      .pipe(
        map(cache => {
          const oldState = cache.get(updatedTopic)
          if (oldState) {
            message.old = oldState.val
            if (!isEqual(message.val, message.old)) {
              message.lc = message.ts
            } else {
              message.lc = oldState.lc ? oldState.lc : oldState.ts
            }
          }
          return message
        }),
        mergeMap(result =>
          this.publish(updatedTopic, result, { qos: 0, retain }).then(() => {
            result.topic = updatedTopic
            return result as Ha4usMessage
          })
        )
      )
      .toPromise()
  }

  public async connect() {
    return new Promise(resolve => {
      this.mqtt.on('connect', () => {
        resolve()
      })
    })
  }

  public async disconnect() {
    this.connected = 0
    return new Promise(resolve => {
      this.mqtt.end(true, () => {
        resolve(true)
      })
    })
  }
}
