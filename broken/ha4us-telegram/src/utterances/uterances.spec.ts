import { test } from 'ava'
import {  Utterance } from './utterances'


test ('easy utterance', t => {
  const utt = new Utterance('Öffne Garage');

  // match all lowercase
  t.deepEqual (utt.test('Öffne GarAge'), true)
  t.deepEqual (utt.test('öffne    garAge'), true)
  t.deepEqual (utt.test('öffne  der  garAge'), true)
  t.deepEqual (utt.test('öffne  die  garAge'), true)
  t.deepEqual (utt.test('öffne  das  garAge'), true)
  t.deepEqual (utt.test('deröffne  die  garAge'), false)
  t.deepEqual (utt.test('der öffne  die  garAge'), false)
  t.deepEqual (utt.test('öffne  die  garAgeEINER'), false)
  t.deepEqual (utt.test('öffne  die  garAge EINER'), false)
  // t.is (utt.match('Öffne  eine  GarAge'), true)
  // t.is (utt.match('Öffne  das  GarAge'), true)
})

test ('utterancs with slots', t => {
  const utt = new Utterance('Mach das {actor} in das {room} an');

  // match all lowercase
  t.deepEqual(utt.slots, ['actor', 'room']);
  t.deepEqual (utt.test('Mach den Schalter in dem Wohnzimmer an'), true)
  // t.is (utt.match('Öffne  eine  GarAge'), true)
  // t.is (utt.match('Öffne  das  GarAge'), true)
})
test ('utterancs not matching', t => {
  const utt = new Utterance('FOO');

  // match all lowercase
  t.is (utt.match('BAR'), null)
  // t.is (utt.match('Öffne  eine  GarAge'), true)
  // t.is (utt.match('Öffne  das  GarAge'), true)
})
test ('matching without slots ', t => {
  const utt = new Utterance('Mach das in das an');
  // match all lowercase
  t.deepEqual (utt.match('Mach den  in dem  an'), {})
  // t.is (utt.match('Öffne  eine  GarAge'), true)
  // t.is (utt.match('Öffne  das  GarAge'), true)
})
test ('matching with slots ', t => {
  const utt = new Utterance('Mach das {actor} in das {room} an');
  // match all lowercase
  t.deepEqual (utt.match('Mach den Schalter in dem Wohnzimmer an'), {room: 'wohnzimmer', actor: 'schalter'})
  // t.is (utt.match('Öffne  eine  GarAge'), true)
  // t.is (utt.match('Öffne  das  GarAge'), true)
})
