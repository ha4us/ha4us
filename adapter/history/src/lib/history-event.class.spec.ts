import test from 'ava'

import { Ha4usMessage } from 'ha4us/core'

import {
  HistoryEvent,
  EventType,
  HistoryBooleanEvent,
  HistoryNumberEvent,
  createEvent,
  unwindEventObject,
} from './history-event.class'

function getMs(isoTime: string) {
  return new Date(isoTime).valueOf()
}

test('Basic History Event ', t => {
  const testMsg: Ha4usMessage = {
    topic: 'test/one/two',
    val: 'TEST',
    ts: '2018-10-04T18:30:32+02:00',
    retain: false,
  }

  let event = createEvent(testMsg)

  t.deepEqual(event.toInsert(), {
    readings: 1,
    topic: 'test/one/two',
    ts: new Date('2018-10-04T18:00:00.000+02:00'),
    type: 'string',
    values: {
      1832: 'TEST',
    },
  })

  t.deepEqual(event.toUpdate(), {
    query: {
      topic: 'test/one/two',
      ts: new Date('2018-10-04T18:00:00.000+02:00'),
    },
    update: {
      $set: { 'values.1832': 'TEST' },
      $inc: { readings: 1 },
    },
  })

  testMsg.val = {}
  event = createEvent(testMsg)
  t.is(event.type, 'other')
})

test('Number History Event ', t => {
  const testMsg: Ha4usMessage = {
    topic: 'test/status/one/two',
    val: 123.45,
    ts: '2018-10-04T18:30:32+02:00',
    retain: false,
  }

  const event = createEvent(testMsg)

  t.deepEqual(event.toInsert(), {
    readings: 1,
    topic: 'test/status/one/two',
    ts: new Date('2018-10-04T18:00:00.000+02:00'),
    type: 'number',
    max: 123.45,
    min: 123.45,
    sum: 123.45,
    values: {
      1832: 123.45,
    },
  })

  t.deepEqual(event.toUpdate(), {
    query: {
      topic: 'test/status/one/two',
      ts: new Date('2018-10-04T18:00:00.000+02:00'),
    },
    update: {
      $set: { 'values.1832': 123.45 },
      $inc: { readings: 1, sum: 123.45 },
      $min: { min: 123.45 },
      $max: { max: 123.45 },
    },
  })
})

test('Boolean True History Event ', t => {
  const testMsg: Ha4usMessage = {
    topic: 'test/status/one/two',
    val: true,
    ts: '2018-10-04T18:30:32+02:00',
    retain: false,
  }

  const event = createEvent(testMsg)

  t.deepEqual(event.toInsert(), {
    readings: 1,
    topic: 'test/status/one/two',
    ts: new Date('2018-10-04T18:00:00.000+02:00'),
    type: 'boolean',
    readingsTrue: 1,
    readingsFalse: 0,
    values: {
      1832: true,
    },
  })

  t.deepEqual(event.toUpdate(), {
    query: {
      topic: 'test/status/one/two',
      ts: new Date('2018-10-04T18:00:00.000+02:00'),
    },
    update: {
      $set: { 'values.1832': true },
      $inc: { readings: 1, readingsTrue: 1 },
    },
  })
})

test('Boolean False History Event ', t => {
  const testMsg: Ha4usMessage = {
    topic: 'test/status/one/two',
    val: false,
    ts: '2018-10-04T18:30:32+02:00',
    retain: false,
  }

  const event = createEvent(testMsg)

  t.deepEqual(event.toInsert(), {
    readings: 1,
    topic: 'test/status/one/two',
    ts: new Date('2018-10-04T18:00:00.000+02:00'),
    type: 'boolean',
    readingsTrue: 0,
    readingsFalse: 1,
    values: {
      1832: false,
    },
  })

  t.deepEqual(event.toUpdate(), {
    query: {
      topic: 'test/status/one/two',
      ts: new Date('2018-10-04T18:00:00.000+02:00'),
    },
    update: {
      $set: { 'values.1832': false },
      $inc: { readings: 1, readingsFalse: 1 },
    },
  })
})

test('Unwind', t => {
  const res = unwindEventObject({
    topic: 'one/two/three',
    ts: new Date('2018-10-04T18:00:00.000+02:00'),
    readings: 0,
    values: {
      '3': 'test',
      '3599': 123.456,
    },
  })
  t.is(res.length, 2)
  t.is(res[0].value, 'test')
  t.is(res[0].name, '2018-10-04T18:00:03.000+02:00')
  t.is(res[1].value, 123.456)
  t.is(res[1].name, '2018-10-04T18:59:59.000+02:00')
})
