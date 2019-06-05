import { filter, map } from 'rxjs/operators'
import { MonoTypeOperatorFunction, OperatorFunction } from 'rxjs'
import { get, convertBuffer } from './helper'
import { MqttMessage, Ha4usMessage, Ha4usObject } from './types'

export namespace Ha4usOperators {
  /**
   * converts a any standard mqtt message to a Ha4usMessage
   */
  export function mqttToHa4us<T = any>(): OperatorFunction<
    MqttMessage,
    Ha4usMessage<T>
  > {
    return map((message: MqttMessage) => {
      const msg = convertBuffer(message.payload)

      return {
        topic: message.topic,
        val: msg && msg.hasOwnProperty('val') ? msg.val : msg,
        ts: msg !== null && msg.ts ? msg.ts : new Date().toISOString(),
        old: msg && msg.old,
        lc: msg && msg.lc,
        retain: message.retain,
      }
    })
  }
  /**
   * filters only for retained ha4us messages
   */
  export function onlyRetained(): MonoTypeOperatorFunction<Ha4usMessage> {
    return filter((msg: Ha4usMessage) => msg.retain === true)
  }
  /**
   * filters only for non -retained ha4us messages
   */
  export function noRetained(): MonoTypeOperatorFunction<Ha4usMessage> {
    return filter((msg: Ha4usMessage) => msg.retain === false)
  }
  /**
   * returns only the topic of a ha4us message
   */
  export function pickTopic(): OperatorFunction<Ha4usMessage, string> {
    return pick<Ha4usMessage, string>('topic')
  }
  /**
   * picks a field from any object
   * @param path path to the property
   */
  export function pick<T, OUT = any>(path: string): OperatorFunction<T, OUT> {
    return map((msg: T) => get(msg, path))
  }

  /**
   * picks a property of each object in a array
   * @param path path to property
   *
   */

  export function pickEach<T>(path: string): OperatorFunction<T[], any[]> {
    return map((msgs: T[]) => (msgs as any[]).map(msg => get(msg, path)))
  }
}
