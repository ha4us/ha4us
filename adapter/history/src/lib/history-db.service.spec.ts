import anyTest, { TestInterface, ExecutionContext } from 'ava'

import { MongoClient, Db, Server } from 'mongodb'

import { from } from 'rxjs'
import {
  take,
  mergeMap,
  tap,
  map,
  toArray,
  debounceTime,
} from 'rxjs/operators'

import { HistoryDb, reduceResult, Unit, AggUnit } from './history-db.service'

import { randomString, Ha4usMessage, merge } from 'ha4us/core'

import { loadMessages } from '../test/testloader'

import { URL } from 'url'
import { DateTime } from 'luxon'

const MONGOURL = 'mongodb://localhost:27017'
const DB_PREFIX = 'MOCK-'
interface Context {
  dbUrl: string
  hs: HistoryDb
}

const test = anyTest as TestInterface<Context>

async function loadTestdata(
  t: ExecutionContext<Context>,
  filename = 'testdata1.yml'
) {
  return from(loadMessages('one/two/three', filename))
    .pipe(
      map(msgs => from(msgs)),
      mergeMap(msgs => t.context.hs.processMessages(msgs)),
      reduceResult(),
      debounceTime(100),
      tap(res =>
        t.log(`${res.nModified + res.nInserted} readings from ${filename}`)
      )
    )
    .toPromise()
}

test.beforeEach(async t => {
  const dbUrl = [MONGOURL, DB_PREFIX + randomString(5)].join('/')
  const hs = new HistoryDb({ dbUrl, name: 'histtest' })

  await hs.connect()
  t.context = {
    dbUrl,
    hs,
  }
})

test.afterEach.always(async t => {
  await MongoClient.connect(t.context.dbUrl, { useNewUrlParser: true }).then(
    async db => {
      t.log('Dropping db', t.context.dbUrl)
      return db.db().dropDatabase()
    }
  )
})

test.only('processing Messages', t => {
  return from(loadMessages('one/two/three', 'testdata1.yml')).pipe(
    tap(msgs => t.log(msgs)),
    map(msgs => from(msgs)),
    mergeMap(msgs => t.context.hs.processMessages(msgs)),
    reduceResult(),
    debounceTime(500),
    tap(res => t.deepEqual(res, { nModified: 2, nInserted: 2 }))
  )
})

test('getting message', async t => {
  await loadTestdata(t)

  await t.context.hs
    .query({ topic: 'one/two/three', aggregateBy: AggUnit.None })
    .pipe(
      toArray(),
      tap(res => {
        t.log('Result', res)
        t.deepEqual(res, [
          {
            name: '2018-10-04T18:01:31.000+02:00',
            value: 1,
          },
          {
            name: '2018-10-04T18:30:02.000+02:00',
            value: 3,
          },
          {
            name: '2018-10-04T18:30:32.000+02:00',
            value: 2,
          },
          {
            name: '2018-10-04T19:30:32.000+02:00',
            value: 4,
          },
        ])
      })
    )
    .toPromise()
})

test('getting message time filter', async t => {
  await loadTestdata(t, 'testdata_get.yml')

  await t.context.hs
    .query({
      topic: 'one/two/three',
      aggregateBy: AggUnit.None,
      to: '2099-12-31T23:59:59.000+02:00',
    })
    .pipe(
      toArray(),
      tap(res => {
        // t.log('All result', res)
        t.is(res.length, 12)
      })
    )
    .toPromise()

  await t.context.hs
    .query({
      topic: 'one/two/three',
      aggregateBy: AggUnit.None,
      from: '2018-10-04T18:01:00.000+02:00',
    })

    .pipe(
      toArray(),
      tap(res => {
        t.is(res.length, 6)
      })
    )
    .toPromise()

  await t.context.hs
    .query({
      topic: 'one/two/three',
      aggregateBy: undefined,
      from: '2017-01-01T18:01:00.000+02:00',
      to: '2017-12-31T18:01:00.000+02:00',
    })

    .pipe(
      toArray(),
      tap(res => {
        t.is(res.length, 1)
      })
    )
    .toPromise()
})

test('getting message by day', async t => {
  await loadTestdata(t, 'testdata_get.yml')

  await t.context.hs
    .query({
      topic: 'one/two/three',
      aggregateBy: AggUnit.Day,
      from: '2018-01-01T18:01:00.000+02:00',
      to: '2018-12-31T18:01:00.000+02:00',
    })
    .pipe(
      toArray(),
      tap(res => {
        t.log('Result', res)
        t.is(res.length, 5)
      })
    )
    .toPromise()
})

test('getting message by week', async t => {
  await loadTestdata(t, 'testdata_get.yml')

  await t.context.hs
    .query({
      topic: 'one/two/three',
      aggregateBy: AggUnit.Week,
      from: '2018-01-01T18:01:00.000+02:00',
      to: '2018-12-31T18:01:00.000+02:00',
    })
    .pipe(
      toArray(),
      tap(res => {
        t.log('Result', res)
        t.is(res.length, 4)
      })
    )
    .toPromise()
})
test('getting message by month', async t => {
  await loadTestdata(t, 'testdata_get.yml')

  await t.context.hs
    .query({
      topic: 'one/two/three',
      aggregateBy: AggUnit.Month,
      from: '2018-01-01T18:01:00.000+02:00',
      to: '2018-12-31T18:01:00.000+02:00',
    })
    .pipe(
      toArray(),
      tap(res => {
        t.log('Result', res)
        t.is(res.length, 3)
      })
    )
    .toPromise()
})
test('getting message by year', async t => {
  await loadTestdata(t, 'testdata_get.yml')

  await t.context.hs
    .query({
      topic: 'one/two/three',
      aggregateBy: AggUnit.Year,
      from: '2018-01-01T18:01:00.000+02:00',
      to: '2060-12-31T18:01:00.000+02:00',
    })
    .pipe(
      toArray(),
      tap(res => {
        t.log('Result', res)
        t.is(res.length, 2)
      })
    )
    .toPromise()
})

test.skip('getting aggregate by none', async t => {
  await loadTestdata(t, 'testdata_get.yml')

  /* await t.context.hs
   // .aggregation(
      'one/two/three',
      AggUnit.None,
      undefined,
      DateTime.fromISO('2060-12-31T18:01:00.000+02:00')
    )
    .pipe(
      toArray(),
      tap(res => {
        t.log('Result', res)
        t.is(res.length, 9)
      })
    )
    .toPromise()*/
})

test('inventory with topic ', async t => {
  await loadTestdata(t, 'testdata_agg_bool.yml')

  await t.context.hs
    .inventory('two/#')
    .pipe(
      toArray(),
      tap(res => {
        t.log('Result', res)
        t.is(res.length, 2)
      })
    )
    .toPromise()
})

test('query without query', async t => {
  await loadTestdata(t, 'testdata_agg_bool.yml')

  await t.context.hs
    .query(undefined)
    .pipe(
      toArray(),
      tap(res => {
        t.log('Result', res)
        t.is(res.length, 3)
      })
    )
    .toPromise()
})
