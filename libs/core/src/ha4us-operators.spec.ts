import test from 'ava'

import { Ha4usMessage } from './types'

import { from } from 'rxjs'
import { tap, take } from 'rxjs/operators'

import { Ha4usOperators } from './ha4us-operators'

test('Operator onlyRetained and pickTopic', t => {
  return from([
    { topic: 'test1', retain: false, val: true, ts: '200' },
    { topic: 'test2', retain: true, val: true, ts: '200' },
  ]).pipe(
    Ha4usOperators.onlyRetained(),
    take(1),
    tap((msg: Ha4usMessage) => {
      t.is(msg.topic, 'test2')
    }),
    Ha4usOperators.pickTopic(),
    tap((topic: string) => {
      t.is(topic, 'test2')
    })
  )
})

test('Operator noRetained and pick', t => {
  return from([
    { topic: 'test1', retain: false, val: 'TEST', ts: '1' },
    { topic: 'test2', retain: true, val: true, ts: '1' },
  ]).pipe(
    Ha4usOperators.noRetained(),
    take(1),
    tap((msg: Ha4usMessage) => {
      t.is(msg.topic, 'test1')
    }),
    Ha4usOperators.pick('val'),
    tap((val: string) => {
      t.is(val, 'TEST')
    })
  )
})
