import { Observable, from, of, throwError } from 'rxjs'
import {
  mergeMap,
  map,
  tap,
  scan,
  toArray,
  pairwise,
  groupBy,
} from 'rxjs/operators'

import { DateTime, DateObject } from 'luxon'
import { Ha4usMessage, Ha4usError, Matcher, MqttUtil } from '@ha4us/core'
import { Ha4usMongoAccess, MongoUtils } from '@ha4us/adapter'

import {
  createEvent,
  HistoryEvent,
  HistoryEventObject,
  unwindEventObject,
  HistoryResult,
  EventType,
} from './history-event.class'

import { inspect } from 'util'

import { AggregationCursor, Cursor } from 'mongodb'
import { match } from 'minimatch'

const debug = require('debug')('ha4us:history:db')

export interface HistoryProcessResult {
  topic: string
  ts: Date
  nInserted: number
  nModified: number
}

export interface HistoryInventory {
  topic: string
  from: Date
  to: Date
  type: EventType
  readings: number
}

export enum Unit {
  'Hour' = 'hour',
  'Day' = 'day',
  'Week' = 'week',
  'Month' = 'month',
  'Year' = 'year',
  'All' = 'all',
}

export enum AggUnit {
  'None' = 'none',
  'Hour' = 'hour',
  'Day' = 'day',
  'Week' = 'week',
  'Month' = 'month',
  'Year' = 'year',
}

export function reduceResult() {
  return scan(
    (acc, val) => {
      acc.nInserted += val.nInserted
      acc.nModified += val.nModified

      return acc
    },
    { nInserted: 0, nModified: 0 }
  )
}

export function aggCursorToRx<T>(source: AggregationCursor<T>): Observable<T> {
  return new Observable(observer => {
    source.each((err, doc) => {
      /*istanbul ignore next*/
      if (err) {
        observer.error(err)
      }
      if (doc) {
        observer.next((doc as unknown) as T)
      } else {
        observer.complete()
      }

      return true
    })

    return () => {
      return source.close()
    }
  })
}

export interface Query {
  from?: string
  to?: string
  topic?: string
  aggregateBy: AggUnit
}

export type QueryResult = any

export class HistoryDb extends Ha4usMongoAccess {
  constructor(opts: { dbUrl: string; name: string }) {
    super(opts.dbUrl, opts.name)
  }

  connect() {
    return super.connect().then(db => {
      this.collection.createIndex(
        { topic: 1, ts: 1 },
        { unique: true, name: 'UniqueTopic' }
      )
      return db
    })
  }

  processMessages(
    event$: Observable<Ha4usMessage>
  ): Observable<HistoryProcessResult> {
    return event$.pipe(
      map(msg => createEvent(msg)),
      mergeMap((event: HistoryEvent) => {
        const update = event.toUpdate()
        debug('Updating', update.query)
        return this.collection
          .updateOne(update.query, update.update)
          .then(res => {
            if (res.result.nModified === 0) {
              return this.collection.insertOne(event.toInsert()).then(() => ({
                topic: update.query.topic,
                ts: update.query.ts,
                nInserted: 1,
                nModified: 0,
              }))
            } else {
              return {
                topic: update.query.topic,
                ts: update.query.ts,
                nInserted: 0,
                nModified: 1,
              }
            }
          })
      }, 1)
    )
  }

  aggregationByTime(
    pattern: string,
    aggUnit: AggUnit,
    fromTs: DateTime,
    toTs: DateTime
  ): Observable<any> {
    const matcher = new Matcher(pattern)

    const $match: any = { topic: matcher.regexp }

    $match.ts = fromTs
      ? { $gte: fromTs.toJSDate(), $lte: toTs.toJSDate() }
      : { $lte: toTs.toJSDate() }

    const $addFields = { date: undefined }

    switch (aggUnit) {
      case AggUnit.Day:
        $addFields.date = {
          $dateFromParts: {
            year: { $year: '$ts' },
            month: { $month: '$ts' },
            day: { $dayOfMonth: '$ts' },
          },
        }
        break
      case AggUnit.Month:
        $addFields.date = {
          $dateFromParts: {
            year: { $year: '$ts' },
            month: { $month: '$ts' },
          },
        }
        break
      case AggUnit.Year:
        $addFields.date = {
          $dateFromParts: {
            year: { $year: '$ts' },
          },
        }
        break
      case AggUnit.Week:
        $addFields.date = {
          $dateFromParts: {
            isoWeekYear: { $year: '$ts' },
            isoWeek: { $isoWeek: '$ts' },
          },
        }
        break
      case AggUnit.None:
      default:
        $addFields.date = '$ts'
        break
    }

    const $group = {
      _id: '$date',
      sum: {
        $sum: '$sum',
      },
      readings: {
        $sum: '$readings',
      },
      max: {
        $max: '$max',
      },
      min: {
        $min: '$min',
      },
    }
    const aggregation = [
      { $match },
      { $addFields },
      { $group },
      {
        $addFields: {
          name: '$_id',
          value: {
            $divide: ['$sum', '$readings'],
          },
        },
      },
      { $project: { _id: 0 } },
      { $sort: { name: 1 } },
    ]

    debug('Aggregation', inspect(aggregation, { depth: null }))

    return aggCursorToRx(this.collection.aggregate(aggregation)).pipe(
      tap(data => debug('Get result', data))
    )
  }

  aggregationByValue(
    topic: string,
    groupings?: any[],
    fromTs?: DateTime,
    toTs?: DateTime
  ) {
    return this.history(topic, fromTs, toTs).pipe(
      pairwise(),
      map(([cur, next]) => ({
        name: cur.name,
        duration: next.name.diff(cur.name),
        value: cur.value,
      })),
      groupBy(point => point.value)
    )
  }

  /**
   * Selects the complete stored history of an topic for a given timerange
   * @param topic topic to select
   * @param fromTs timestamp from which point of time (inclusive)
   * @param toTs timestamp to which point of time (inclusive)
   */
  history(
    topic: string,
    fromTs: DateTime,
    toTs: DateTime
  ): Observable<HistoryResult> {
    const $match: any = { topic }
    $match.ts = fromTs
      ? { $gte: fromTs.toJSDate(), $lte: toTs.toJSDate() }
      : { $lte: toTs.toJSDate() }

    debug('Getting History of ', topic)
    return MongoUtils.cursorToRx(
      this.collection
        .find($match)
        .project({ topic: 0 })
        .sort({ ts: 1 })
    ).pipe(mergeMap((res: HistoryEventObject) => from(unwindEventObject(res))))
  }

  /**
   * Returns a inventory of the history database group by topic and the stored time range and
   * stored readings
   * @param topicPattern the topic pattern to select in database
   */
  inventory(topicPattern?: string): Observable<HistoryInventory> {
    let $match: any
    if (topicPattern) {
      const matcher = new Matcher(topicPattern)
      $match = {
        topic: matcher.regexp,
      }
    } else {
      $match = {}
    }

    const aggregation = [
      { $match },
      {
        $group: {
          _id: '$topic',
          from: { $min: '$ts' },
          to: { $max: '$ts' },
          type: { $first: '$type' },
          readings: { $sum: '$readings' },
        },
      },
      {
        $project: {
          _id: 0,
          topic: '$_id',
          from: 1,
          to: 1,
          type: 1,
          readings: 1,
        },
      },
    ]

    return aggCursorToRx(this.collection.aggregate(aggregation))
  }

  query(query: Query): Observable<QueryResult> {
    if (!query || !query.topic) {
      return this.inventory()
    }
    debug('Query', query)
    query.aggregateBy = query.aggregateBy || AggUnit.None

    const toTs = query.to ? DateTime.fromISO(query.to) : DateTime.local()
    const fromTs = query.from ? DateTime.fromISO(query.from) : undefined

    debug(
      `Querying date range from ${fromTs} to ${toTs} with aggregation ${
        query.aggregateBy
      } and topic ${query.topic}`
    )

    if (query.aggregateBy === AggUnit.None) {
      return this.history(query.topic, fromTs, toTs)
    }

    debug('Query called', query)
    return this.aggregationByTime(query.topic, query.aggregateBy, fromTs, toTs)
  }
}
