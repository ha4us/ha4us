import test from 'ava'
import {AlexaUtterance} from './alexautterance'

test('can create alexautterance', t => {
  const uttText = '{my|your} {favorite|least favorite} snack is {-|Fruit}'
  const utt = new AlexaUtterance(uttText)

  t.is(utt.utterance, uttText)
})

test('can test alexautterance', t => {
  const uttText = '{my|your} {favorite|least favorite} snack is {-|Fruit}'
  const utt = new AlexaUtterance(uttText)

  t.is(utt.test('my least favorite snack is orange'), true)
  t.is(utt.test('your favorite snack is apple'), true)
  t.is(utt.test('your unknown snack is apple'), false)
})

test('can resolves the slots alexautterance', t => {
  const uttText = '{my|your} {favorite|least favorite} snack is {-|Fruit}'
  const utt = new AlexaUtterance(uttText)

  t.deepEqual(utt.match('my least favorite snack is orange'), {fruit: 'orange'})
  t.deepEqual(utt.slots, ['fruit'])
  t.deepEqual(utt.match('your favorite snack is apple'), {fruit: 'apple'})
  t.deepEqual(utt.match('your unkown snack is apple'), null)


})
