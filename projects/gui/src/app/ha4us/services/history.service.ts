import { Injectable } from '@angular/core'

import { Observable } from 'rxjs'

import { StatesService } from './state.service'

const moment = require('moment')

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  constructor(private $states: StatesService) {}

  public async read(topic: string, type: string, from: string, delta: string) {
    return this.$states
      .request(
        'history/query',
        {
          topic,
          type,
          from: moment(from)
            .endOf('day')
            .format(),
          delta,
        },
        20000
      )
      .then(result => {
        if (type === 'timestamp' || type === 'flat') {
          result.val.result.forEach(element => {
            element.name = new Date(element.name)
          })
        }
        switch (type) {
          case 'duration':
          case 'count':
            return result.val
          default:
            result.val.result = [{ name: topic, series: result.val.result }]
            return result.val
        }
      })
  }
}
