import test from 'ava'
import { Objectselector } from './object-selector'

test('basic initialzation', t => {
  const select = new Objectselector()

  t.is(select.valid(), true)
  t.is(select.pattern, '#')
  t.deepEqual(select.tags, undefined)
})

test('selector without tags', t => {
  const select = new Objectselector('foo/#/baz')

  t.is(select.valid(), true)
  t.is(select.pattern, 'foo/#/baz')
  t.deepEqual(select.tags, undefined)
})
test('selector with empty tags', t => {
  const select = new Objectselector('foo/#/baz[]')

  t.is(select.valid(), true)
  t.is(select.pattern, 'foo/#/baz')
  t.deepEqual(select.tags, [])
})
test('selector with tags', t => {
  const select = new Objectselector('foo/#/baz[ @livingroom, Test , #Light]')

  t.is(select.valid(), true)
  t.is(select.pattern, 'foo/#/baz')

  t.deepEqual(select.tags, ['@livingroom', 'Test', '#Light'])
  t.deepEqual(select.topicRegex, /^foo\/(.*?)\/baz$/)
})
test('selector with tags no pattern', t => {
  const select = new Objectselector('[@livingroom,Test,#Light]')

  t.is(select.valid(), true)
  t.is(select.pattern, '#')
  t.deepEqual(select.tags, ['@livingroom', 'Test', '#Light'])
})
test('selector with tags invalid', t => {
  const select = new Objectselector(
    'foo/#/baz[@livingroom,Test,#Light][invalid]'
  )

  t.is(select.valid(), false)
})
test('selector with tags invalid 2', t => {
  const select = new Objectselector('foo/#/baz[[@livingroom,Test,#Light]')

  t.is(select.valid(), false)
})
