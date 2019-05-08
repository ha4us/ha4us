const VALID_TOPIC = /^[^#\+]+$/
const VALID_PATTERN = /^(([\+#]{1}|[^\+#]*)\/)?(([\+#]{1}|[^\+#]*)\/{1})*(([\+#]{1}|[^\+#]*))$/

import { Matcher } from './matcher'

export namespace MqttUtil {
  export const MQTT_SEP = '/'

  export function join(
    topic: string[] | string,
    ...moreSubTopics: string[]
  ): string {
    if (typeof topic === 'string') {
      return topic + MQTT_SEP + join(moreSubTopics)
    } else {
      return topic.join(MQTT_SEP)
    }
  }

  export function split(topic: string): string[] {
    return topic.split(MQTT_SEP)
  }

  export function splice(
    topic: string,
    index: number,
    deleteCount = 999,
    ...topics: string[]
  ) {
    const topicArr = split(topic)

    topicArr.splice(index, deleteCount, ...topics)

    return join(topicArr)
  }

  export function strip(topic: string, index: number = 1, count: number = 1) {
    return splice(topic, index, count)
  }

  export function inject(
    topic: string,
    index: number,
    count?: number,
    ...members: string[]
  ): string {
    return splice(topic, index, count, ...members)
  }

  export function slice(topic: string, begin: number, end?: number) {
    return join(split(topic).slice(begin, end))
  }

  export function resolve(
    topic: string,
    command?: string,
    domain?: string
  ): string {
    if (domain) {
      topic = topic.replace(/^(\/)?\$/, '$1' + domain + MQTT_SEP)
    }

    if (topic.charAt(0) === MQTT_SEP) {
      return topic.substring(1)
    } else if (command) {
      topic = inject(topic, 1, 0, command)
    }
    return topic
  }

  export function validTopic(topic: string): boolean {
    return VALID_TOPIC.test(topic)
  }

  export function validPattern(pattern: string): boolean {
    return VALID_PATTERN.test(pattern)
  }

  export function isPattern(pattern: string): boolean {
    return !validTopic(pattern) && validPattern(pattern)
  }

  export function filter(pattern: string, property = 'topic') {
    const matcher = new Matcher(pattern)
    return object => matcher.test(object[property])
  }
}
