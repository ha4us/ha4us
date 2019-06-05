import {
  Observable,
  using,
  Subject,
  Subscription,
  fromEvent,
  merge,
  bindNodeCallback,
  combineLatest,
} from 'rxjs'

import {
  share,
  filter,
  timeout,
  map,
  take,
  refCount,
  publishReplay,
} from 'rxjs/operators'

import { Matcher } from './matcher'
import { MqttMessage, Ha4usMessage, MqttClient } from './types'
import { ISubscriptionGrant, IClientPublishOptions } from 'mqtt'
import { MqttUtil } from './utility'
import { randomString } from './helper'
import { Ha4usOperators } from './ha4us-operators'
import * as Debug from 'debug'

const debug = Debug('ha4us:mqtt')

/**
 * With an instance of MqttService, you can observe and subscribe to MQTT in multiple places, e.g. in different components,
 * to only subscribe to the broker once per MQTT filter.
 * It also handles proper unsubscription from the broker, if the last observable with a filter is closed.
 */
export class MqttService {
  /** a map of all mqtt observables by filter */
  public observables: { [filter: string]: Observable<Ha4usMessage> } = {}
  /** an observable of the last mqtt message */
  public messages: Observable<MqttMessage> = new Observable<MqttMessage>()

  public domain: string | undefined = undefined

  /**
   * The constructor needs a up and running MqttClient
   * @param client an instance of MQTT.Client
   */
  constructor(protected client: MqttClient) {
    this.messages = fromEvent(client, 'message').pipe(
      map(([_topic, _message, packet]) => packet as MqttMessage),
      share()
    )
  }

  /**
   * With this method, you can observe messages for a mqtt topic.
   * The observable will only emit messages matching the filter.
   * The first one subscribing to the resulting observable executes a mqtt subscribe.
   * The last one unsubscribing this filter executes a mqtt unsubscribe.
   * @param       filterInput filter as string
   * @return      the observable you can subscribe to
   */
  public observe<T = any>(
    filterInput: string,
    ...addFilter: string[]
  ): Observable<Ha4usMessage<T>> {
    if (addFilter.length > 0) {
      addFilter.unshift(filterInput)

      return merge(...addFilter.map((_f: string) => this.observe<T>(_f)))
    }

    const pattern = new Matcher(
      MqttUtil.resolve(filterInput, 'status', this.domain)
    )
    debug('Observing', pattern.pattern)
    if (!this.observables[pattern.pattern]) {
      const rejected: Subject<MqttMessage> = new Subject()
      this.observables[pattern.pattern] = using(
        // resourceFactory: Do the actual ref-counting MQTT subscription.
        // refcount is decreased on unsubscribe.
        () => {
          const subscription: Subscription = new Subscription()
          this.client.subscribe(
            pattern.topic,
            { qos: 0 },
            (err: Error, granted: ISubscriptionGrant[]) => {
              granted.forEach((_granted: ISubscriptionGrant) => {
                if (err) {
                  rejected.error(`error subscribing '${pattern.topic}'`)
                }
                if (_granted.qos === 128) {
                  delete this.observables[_granted.topic]
                  this.client.unsubscribe(_granted.topic)
                  rejected.error(
                    `subscription for '${_granted.topic}' rejected!`
                  )
                }
              })
            }
          )
          subscription.add(() => {
            debug('Unsubscribing', pattern.topic)
            delete this.observables[pattern.pattern]
            this.client.unsubscribe(pattern.topic)
          })
          return subscription
        },
        // observableFactory: Create the observable that is consumed from.
        // This part is not executed until the Observable returned by
        // `observe` gets actually subscribed.
        () => merge(rejected, this.messages)
      ).pipe(
        Ha4usOperators.mqttToHa4us<T>(),
        map(message => {
          const match = pattern.match(message.topic)
          if (match) {
            message.match = {
              pattern: pattern.pattern,
              params: match,
            }
          }

          return message
        }),
        filter(msg => msg.hasOwnProperty('match')),
        publishReplay<Ha4usMessage<T>>(1),
        refCount<Ha4usMessage<T>>()
      )
    }
    return this.observables[pattern.pattern] as Observable<Ha4usMessage<T>>
  }

  /**
   * observe multipe topics and picks all latest ones.
   * be aware the every topic has to emit at least once
   * @param  pattern list of pattern
   * @return            observable of the combined latest emits
   */
  public observeLatest<T = any>(
    ...pattern: string[]
  ): Observable<Ha4usMessage<T>[]> {
    if (pattern.length < 2) {
      throw new Error('observe latest must have a least two pattern')
    }

    return combineLatest(...pattern.map((_f: string) => this.observe<T>(_f)))
  }

  /**
   * This method publishes a message for a topic with optional options.
   * The returned observable will complete, if publishing was successful
   * and will throw an error, if the publication fails
   * @param           topic the topic
   * @param              message the message
   * @param    options options
   * @return a promise of the result
   */

  public publish(
    topic: string,
    message: any,
    options?: IClientPublishOptions
  ): Promise<any> {
    const observablePublish = bindNodeCallback(
      this.client.publish.bind(this.client)
    )
    return observablePublish(
      topic,
      message === null ? '' : JSON.stringify(message),
      options
    )
      .pipe(take(1))
      .toPromise()
  }

  public delete(topic: string) {
    return this.publish(MqttUtil.resolve(topic, 'status', this.domain), null, {
      retain: true,
      qos: 0,
    })
  }

  public set(topic: string, value: any) {
    return this.publish(MqttUtil.resolve(topic, 'set', this.domain), value, {
      qos: 0,
      retain: false,
    })
  }

  public async get<T = any>(
    topic: string,
    opts: { emitGet?: boolean; timeout?: number } = {}
  ): Promise<Ha4usMessage | undefined> {
    opts = Object.assign(
      {
        emitGet: false,
        timeout: 500,
      },
      opts
    )

    const observer = this.observe<T>(topic).pipe(
      timeout(opts.timeout),
      take(1)
    )

    if (opts.emitGet) {
      this.publish(MqttUtil.resolve(topic, 'get', this.domain), null, {
        qos: 0,
        retain: false,
      })
    }

    return observer.toPromise()
  }

  public async command(topic: string, cb: (params: any) => Promise<any>) {
    return this.observe('/$command/' + topic + '/+').subscribe(
      async message => {
        const response = await cb(message.val)
        const param = message.match.params[0]
        const answerTopic = MqttUtil.resolve(
          '$' + MqttUtil.join([topic, param]),
          'status',
          this.domain
        )
        debug('Answering request', topic, answerTopic)
        this.publish(answerTopic, response, { qos: 0, retain: false })
      }
    )
  }

  public async request<REQ = any, RES = any>(
    topic: string,
    body: REQ,
    aTimeout: number = 5000
  ): Promise<Ha4usMessage<RES>> {
    topic = MqttUtil.join([topic, randomString(10)])

    const commandTopic = MqttUtil.resolve(topic, 'command')

    const result = this.observe<RES>(topic)
      .pipe(
        take(1),
        timeout(aTimeout)
      )
      .toPromise()

    this.publish(commandTopic, body, { retain: false, qos: 0 })

    return result
  }

  public reconnect() {
    this.client.reconnect()
  }
}
