import test from 'ava'
import { MqttUtil } from './utility'

const util = MqttUtil

test('join', t => {
  t.is(util.join(['foo', 'bar', 'baz']), 'foo/bar/baz')
  t.is(util.join('foo', 'bar', 'baz'), 'foo/bar/baz')
})
test('split', t => {
  t.deepEqual(util.split('foo/bar/baz'), ['foo', 'bar', 'baz'])
})
test('strip', t => {
  t.deepEqual(util.strip('foo/bar/baz', 0, 1), 'bar/baz')
  t.deepEqual(util.strip('foo/bar/baz', 1, 1), 'foo/baz')
  t.deepEqual(util.strip('foo/bar/baz', 2, 1), 'foo/bar')
  t.deepEqual(util.strip('foo/bar/baz', 1, 2), 'foo')
  t.deepEqual(util.strip('foo/bar/baz'), 'foo/baz')
})

test('inject', t => {
  t.deepEqual(util.inject('foo/bar/baz/foo', 1, 2), 'foo/foo')
  t.deepEqual(util.inject('foo/bar/baz/foo', 1), 'foo')
  t.deepEqual(util.inject('foo/bar/baz/foo', 1, 3), 'foo')
  t.deepEqual(util.inject('foo/bar/baz/foo', 2), 'foo/bar')
  t.deepEqual(
    util.inject('foo/bar/baz/foo', 1, 2, 'bar/baz'),
    'foo/bar/baz/foo'
  )
})

test('resolve', t => {
  t.is(util.resolve('/foo/bar/baz'), 'foo/bar/baz')
  t.is(util.resolve('foo/bar/baz'), 'foo/bar/baz')
  t.is(util.resolve('foo/b$ar/baz'), 'foo/b$ar/baz')

  t.is(util.resolve('/foo/bar/baz', 'xyz'), 'foo/bar/baz')
  t.is(util.resolve('foo/bar/baz', 'xyz'), 'foo/xyz/bar/baz')
  t.is(util.resolve('foo/bar/baz', 'xyz', 'domain'), 'foo/xyz/bar/baz')

  t.is(util.resolve('$foo/bar/baz', 'xyz', 'domain'), 'domain/xyz/foo/bar/baz')
  t.is(util.resolve('/$foo/bar/baz', 'xyz', 'domain'), 'domain/foo/bar/baz')
  t.is(util.resolve('/$foo/bar/baz', 'xyz', 'domain'), 'domain/foo/bar/baz')
  t.is(util.resolve('/foo/ba$r/baz', 'xyz', 'domain'), 'foo/ba$r/baz')
})

test('valid topic', t => {
  t.deepEqual(util.validTopic('foo/bar/baz/foo'), true)
  t.deepEqual(util.validTopic('foo/bar/+/foo'), false)
  t.deepEqual(util.validTopic('foo/bar/#/foo'), false)
})
test('valid pattern', t => {
  t.deepEqual(util.validPattern('foo/bar/baz/foo'), true)
  t.deepEqual(util.validPattern('foo/bar/+/foo'), true)
  t.deepEqual(util.validPattern('foo/bar/#/foo'), true)
})

test('isPattern', t => {
  t.deepEqual(util.isPattern('foo/bar/baz/foo'), false)
  t.deepEqual(util.isPattern('foo/bar/+/foo'), true)
  t.deepEqual(util.isPattern('foo/bar/#/foo'), true)
  t.deepEqual(util.isPattern('####'), false)
})

test('slice', t => {
  t.deepEqual(util.slice('foo/bar/baz/foo', 0, 1), 'foo')
  t.deepEqual(util.slice('foo/bar/baz/foo', 1, 2), 'bar')
  t.deepEqual(util.slice('foo/bar/baz/foo', -2), 'baz/foo')
  t.deepEqual(util.slice('foo/bar/baz/foo', 1), 'bar/baz/foo')
})

test('splice', t => {
  t.is(util.splice('foo/bar/baz/foo', 2), 'foo/bar')
  t.is(util.splice('foo/bar/baz/foo', 2, 1), 'foo/bar/foo')
  t.is(util.splice('foo/bar/baz/foo', 2, 0), 'foo/bar/baz/foo')
  t.is(util.splice('foo/bar/baz/foo', 1, 1, 'test'), 'foo/test/baz/foo')
})

test('filter', t => {
  let filter = util.filter('+')
  t.is(filter({ topic: 'test' }), true)
  t.is(filter({ topic: 'test/eins' }), false)

  filter = util.filter('+', 'state')
  t.is(filter({ state: 'test' }), true)
  t.is(filter({ state: 'test/eins' }), false)
})
