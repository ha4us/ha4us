import test from 'ava'
import { ValueMap, IValueMap, ValueCondition } from './valuemap.class'

const SIMPLEMAP: IValueMap<string, string> = {
  name: 'SimpleMap',
  ifthens: [],
  else: '10',
}
const TESTMAP: IValueMap<boolean, string> = {
  name: 'OpenClose',
  description: 'True means open!',
  type: 'string',
  ifthens: [
    {
      if: {
        op: '=',
        value: [undefined],
      },
      then: 'Unknown',
    },
    {
      if: {
        op: '=',
        value: [true],
      },
      then: 'Open',
    },
  ],
  else: 'Close',
}

test('numerical conditions', t => {
  const cond = new ValueCondition('=', 10.1)
  t.is(cond.type, 'number')
  t.is(cond.test(10.1), true)
  t.is(cond.test(11), false)
  cond.setOp('>')
  t.is(cond.test(10.1), false)
  t.is(cond.test(11), true)
  cond.setOp('>=')
  t.is(cond.test(10.1), true)
  t.is(cond.test(11), true)
  cond.setOp('<')
  t.is(cond.test(9), true)
  t.is(cond.test(10.1), false)
  cond.setOp('<=')
  t.is(cond.test(9), true)
  t.is(cond.test(10), true)
  t.is(cond.test(10.1), true)
  t.is(cond.test(10.11), false)
  cond.setOp('!=')
  t.is(cond.test(9), true)
  t.is(cond.test(10), true)
  t.is(cond.test(10.1), false)
  const cond2 = new ValueCondition('isBetween', 9, 10)
  t.is(cond2.type, 'number')
  t.is(cond2.test(9), true)
  t.is(cond2.test(10), false)
  t.is(cond2.test(9.5), true)
})
test('contains condition', t => {
  const cond3 = new ValueCondition('contains', 'test')
  t.is(cond3.test('Hello test!!!'), true)
  t.is(cond3.test('Hello world!!!'), false)
})
test('regex condition', t => {
  const cond4 = ValueCondition.from({
    op: 'matches',
    value: ['Hello (earth|world)$'],
  })
  t.is(cond4.test('Hello earth?'), false)
  t.is(cond4.test('Hello earth'), true)
  t.is(cond4.test('Hello world'), true)
  t.is(cond4.test('Goodbye world'), false)
})

test('toJson of MapCondition', t => {
  const cond4 = ValueCondition.from({
    op: 'matches',
    value: ['Hello (earth|world)$'],
  })
  t.deepEqual(cond4.toJSON(), {
    op: 'matches',
    value: ['Hello (earth|world)$'],
  })
})

test('Parameter check', t => {
  t.throws(
    () => new ValueCondition('=', 10.1, 2),
    /please supply 1 parameters for operator/
  )
  t.throws(() => new ValueCondition('isBetween', 10.1), /please supply 2/)
})

test('Simple Valuemap', t => {
  const map = ValueMap.from(SIMPLEMAP)
  t.is(map.map('10'), '10')
  t.is(map.map('Hello!'), '10')
})

test('Normal Valuemap', t => {
  const map = ValueMap.from(TESTMAP)
  t.is(map.map(true), 'Open')
  t.is(map.map(false), 'Close')
  t.is(map.map(undefined), 'Unknown')
})

test('toJSON', t => {
  const map = ValueMap.from(TESTMAP)
  t.deepEqual(map.toJSON(), TESTMAP)
  const map2 = ValueMap.from(SIMPLEMAP)
  t.is(map2.toJSON().type, 'string')
})
