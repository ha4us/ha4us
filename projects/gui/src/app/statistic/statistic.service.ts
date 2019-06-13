import { Injectable } from '@angular/core'

import { StatesService, AdapterService } from '@ha4us/ng'
import moment from 'moment'
import { DateTime } from 'luxon'
const debug = require('debug')('ha4us:gui:statistic')

export enum AggUnit {
  'None' = 'none',
  'Hour' = 'hour',
  'Day' = 'day',
  'Week' = 'week',
  'Month' = 'month',
  'Year' = 'year',
}
export interface StatisticQuery {
  topic: string
  to: string
  duration: string
  aggregateBy: AggUnit
}
@Injectable({
  providedIn: 'root',
})
export class StatisticService {
  instanceTopic = 'history'
  constructor(protected states: StatesService, protected as: AdapterService) {
    as.getInstances('history').subscribe(obj => {
      this.instanceTopic = obj[0].topic
    })
  }

  inventory(topic?: string) {
    return this.states
      .request(this.instanceTopic + '/query', { topic })
      .then(data => data.val)
  }

  async aggregate(
    topic: string,
    aggregateBy: string = 'none',
    from: string,
    to: string
  ) {
    debug('Calling aggregate', topic, aggregateBy, from, to)
    return this.states
      .request(this.instanceTopic + '/aggregate', {
        topic,
        aggregateBy,
        from,
        to,
      })
      .then(data => {
        debug('Aggregation result', data)
        return data.val.map(point => ({
          ...point,
          name: new Date(point.name),
          max: point.max === null ? undefined : point.max,
          min: point.min === null ? undefined : point.min,
          value: point.value === null ? point.readings : point.value,
        }))
      })
      .then(data => {
        debug('Aggregation result', data)
        return data
      })
  }
  aggregateBar(topic: string, aggregateBy: string = 'none') {
    return this.states
      .request(this.instanceTopic + '/aggregate', { topic, aggregateBy })
      .then(data => {
        return {
          name: topic,
          series: data.val
            // .filter((_, idx) => idx >= 1000)
            .map(point => ({
              name: new Date(point.name),
              value: point.readings,
            })),
        }
      })
  }

  getFormatFunction(unit: AggUnit) {
    let formatString: string
    switch (unit) {
      case AggUnit.Hour:
        formatString = 'DD.MM.YY HH:mm'
        break
      case AggUnit.Day:
        formatString = 'DD.MM.YY'
        break
      case AggUnit.Week:
        formatString = 'ww YYYY'
        break
      case AggUnit.Month:
        formatString = 'MMM YYYY'
        break
      case AggUnit.Year:
        formatString = 'YYYY'
        break
      default:
        formatString = 'DD.MM.YY HH:mm'
    }

    return (date: Date) => moment(date).format(formatString)
  }

  createDateRange(
    isoDuration: string,
    end?: string
  ): { from: string; to: string } {
    const toMom = end ? moment(end) : moment()
    const duration = moment.duration(isoDuration)

    debug(`Duration ${isoDuration} is ${duration}`)

    const fromMom = toMom.clone().add(-duration)

    return {
      from: isoDuration ? fromMom.toISOString() : undefined,
      to: toMom.toISOString(),
    }
  }
}
