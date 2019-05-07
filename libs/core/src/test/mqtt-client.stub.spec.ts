import { test } from 'ava'

import { MqttClientStub } from './mqtt-client.stub'

test('check subscribe and unsubscribe', t => {
  const stub = new MqttClientStub()
  t.plan(2)
  stub.subscribe('#', { qos: 1 }, result => {
    t.is(result, null)
  })
  stub.subscribe('#', { qos: 1 })
  stub.unsubscribe('#', result => {
    t.is(result, null)
  })
})
test('test publish', t => {
  const stub = new MqttClientStub()
  t.plan(1)
  stub.on('message', () => {
    t.pass()
  })
  stub.publish('test', 'test', { qos: 0, retain: false })
})

test('test publish null', t => {
  const stub = new MqttClientStub()
  t.plan(1)
  stub.on('message', () => {
    t.pass()
  })
  stub.publish('test', null, { qos: 0, retain: false })
})
