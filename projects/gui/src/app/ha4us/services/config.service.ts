import { Injectable } from '@angular/core'

import { HttpClient, HttpParams, HttpHeaders, HttpRequest } from '@angular/common/http'


import { Ha4usConfig, Ha4usError, MqttUtil } from '@ha4us/core'
const debug = require('debug')('ha4us:gui:config:service')
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  static apiUrl = '/api/config'
  configuration: { [key: string]: Ha4usConfig<any> } = {}

  protected preloaded = false

  get isLoaded() {
    return this.preloaded
  }

  constructor(protected http: HttpClient) {}

  preload(): Promise<void> {
    return this.http
      .get(ConfigService.apiUrl)
      .toPromise()
      .catch(Ha4usError.wrapErr)
      .then((data: Ha4usConfig<any>[]) => {
        debug('%d configs loaded', data.length)
        data.forEach(config => (this.configuration[config.topic] = config))

        this.preloaded = true

        return
      })
  }

  set<T>(topic: string, value: T, type?: string) {
    const config: Ha4usConfig<T> = {
      topic,
      type,
      value,
    }

    return this.http
      .put(ConfigService.apiUrl + '/' + config.topic, config)
      .toPromise()
      .catch(Ha4usError.wrapErr)
      .then(data => {
        this.configuration[config.topic] = config
        return config
      })
  }

  getOne<T>(topic: string): T {
    const config = this.configuration[topic]
    if (config !== undefined) {
      return config.value
    } else {
      return undefined
    }
  }
  get<T>(pattern: string): Ha4usConfig<T>[] {
    return Object.keys(this.configuration)
      .map(key => this.configuration[key])
      .filter(MqttUtil.filter(pattern))
  }

  delete(topic: string): Promise<void> {
    return this.http
      .delete(ConfigService.apiUrl + '/' + topic)
      .toPromise()
      .catch(Ha4usError.wrapErr)
      .then(data => {
        delete this.configuration[topic]
        return
      })
  }
}
