import test from 'ava'

import {
  convertBuffer,
  sprintf,
  incName,
  dezTo10h,
  uuid,
  normalizeNumber,
  extractTags,
  groupBy,
  unique,
  distinctDeep,
  convertWildcarded,
} from './helper'

test('buffer conversion', t => {
  let message: Buffer
  message = Buffer.from('true')
  t.is(convertBuffer(message), true)
  message = Buffer.from('test')
  t.is(convertBuffer(message), 'test')
  message = Buffer.from('1.2345')
  t.is(convertBuffer(message), 1.2345)
  message = Buffer.from('{"hello":"world"}')
  t.deepEqual(convertBuffer(message), { hello: 'world' })
})

test('sprintf', t => {
  t.is(sprintf('HALLO WELT'), 'HALLO WELT')
  t.is(sprintf('HALLO %%f WELT'), 'HALLO %f WELT')
  t.is(sprintf('HALLO %s', 'WELT'), 'HALLO WELT')
  t.is(sprintf('HALLO %f', 99.12345), 'HALLO 99,12345')
  t.is(sprintf('HALLO %.f', 99.12345), 'HALLO 99.12345')
  t.is(sprintf('HALLO %,f', 99.12345), 'HALLO 99,12345')
  t.is(sprintf('HALLO %,2f', 99.12345), 'HALLO 99,12')
  t.is(sprintf('HALLO %,4f', 99.12345), 'HALLO 99,1235')
  t.is(sprintf('HALLO %,2f€', 99.12345), 'HALLO 99,12€')
  t.is(sprintf('HALLO %,2f€', 'test'), 'HALLO NaN€')
  t.is(sprintf('HALLO %,0f%% %s', 99.5, 'WELT'), 'HALLO 100% WELT')
})

test('incName', t => {
  t.is(incName('Hallo'), 'Hallo 1')
  t.is(incName('Hallo1'), 'Hallo1 1')
  t.is(incName('Hallo 1'), 'Hallo 2')
  t.is(incName('Hallo1 2'), 'Hallo1 3')
})

test('dez2Hex', t => {
  t.is(dezTo10h(1099511627775), 'FFFFFFFFFF')
  t.is(dezTo10h(1099511627776), '0000000000')
  t.is(dezTo10h(123456789), '00075BCD15')
  t.is(dezTo10h(1), '0000000001')
  t.is(dezTo10h(0), '0000000000')
})

test('uuid', t => {
  const aUuid = uuid()
  t.is(aUuid.length, 36)
})

test('normalizeNumber', t => {
  t.is(normalizeNumber('12345'), '+494012345')
  t.is(normalizeNumber('04012345'), '+494012345')
  t.is(normalizeNumber('+494012345'), '+494012345')
  t.is(normalizeNumber('12345', '+xx', 'yy'), '+xxyy12345')
})

test('extractText', t => {
  t.deepEqual(extractTags('Hello World!'), ['Hello World!'])
  t.deepEqual(extractTags('@ulfalfa Hello World! '), [
    'Hello World! ',
    '@ulfalfa',
  ])
  t.deepEqual(
    extractTags('Hello  !excla #hash    @at _underscore       World!'),
    ['Hello  World!', '!excla', '#hash', '@at', '_underscore']
  )
  t.deepEqual(
    extractTags('Hello  !excla #hash    @at _underscore       World!', '#'),
    ['Hello  !excla @at _underscore       World!', '#hash']
  )
})

test('groupBy', t => {
  t.deepEqual(groupBy(['one', 'two', 'three'], key => key.length), {
    3: ['one', 'two'],
    5: ['three'],
  })
  const data = [
    { kind: 'vegtable', name: 'Potato' },
    { kind: 'fruit', name: 'Peach' },
    { kind: 'vegtable', name: 'Carot' },
    { kind: 'fruit', name: 'Apple' },
    { kind: 'fruit', name: 'Banana' },
  ]

  t.deepEqual(groupBy(data, key => key.kind), {
    vegtable: [
      { kind: 'vegtable', name: 'Potato' },
      { kind: 'vegtable', name: 'Carot' },
    ],
    fruit: [
      { kind: 'fruit', name: 'Peach' },
      { kind: 'fruit', name: 'Apple' },
      { kind: 'fruit', name: 'Banana' },
    ],
  })
})

test('unique', t => {
  t.deepEqual(unique(['a', 1, 'a', 2, '1']), ['a', 1, 2, '1'])
})

test('distinctDeep', t => {
  const values = [
    {
      tag: ['fünf', 'eins', 'zwei'],
    },
    {
      tag: ['zwei', 'drei', 'vier'],
    },
    {
      tag: ['fünf', 'fünf'],
    },
  ]

  t.deepEqual(distinctDeep(values, 'tag'), [
    'fünf',
    'eins',
    'zwei',
    'drei',
    'vier',
  ])
})

test('convertWildcarded', t => {
  t.is(convertWildcarded('1*2/+?[]*3').test('1xyz2/+?[]foo3'), true)
})
