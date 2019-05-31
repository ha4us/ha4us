import anyTest, { Macro, TestInterface } from 'ava'
import { MqttService, Ha4usMessage } from './index'
import { Ha4usOperators } from './ha4us-operators'
import { of } from 'rxjs'
import { take, catchError, toArray } from 'rxjs/operators'
import { spy, stub, useFakeTimers, SinonFakeTimers } from 'sinon'
import { MqttClientStub } from './test/mqtt-client.stub'

interface Context {
  mqtt: MqttClientStub
  clock: SinonFakeTimers
}

const test = anyTest as TestInterface<Context>

test.beforeEach('Establishing mqtt client', t => {
  t.context = {
    mqtt: new MqttClientStub(),
    clock: useFakeTimers(),
  }
})

test('Receive correct message type', t => {
  const service = new MqttService(t.context.mqtt)

  const observer = service.observe('/test/hallo2').pipe(take(1))

  observer.subscribe(value => {
    t.is(value.topic, 'test/hallo2')
    t.is(value.val, 'world')
    t.is(value.retain, false)
  })

  t.context.mqtt.publish('test/hallo2', 'world', { retain: false, qos: 0 })
  return observer
})

test('Subscribe to pattern', t => {
  const service = new MqttService(t.context.mqtt)
  const observer = service.observe('/#/hallo2').pipe(take(1))
  observer.subscribe(value => {
    t.is(value.topic, 'test/hallo2')
    t.is(value.ts, '12345')
    t.is(value.val, 'helloworld')
    t.is(value.retain, false)
    t.deepEqual(value.match, { pattern: '#/hallo2', params: ['test'] })
  })

  t.context.mqtt.publish('test/hallo2', '{"val":"helloworld","ts":"12345"}', {
    retain: false,
    qos: 0,
  })
  t.context.mqtt.publish('test/hallo1', '{"val":"helloworld","ts":"12345"}', {
    retain: false,
    qos: 0,
  })
  return observer
})

test('Observe with error', t => {
  const subscribeStub = stub(t.context.mqtt, 'subscribe').yields(new Error(), [
    { qos: -128, topic: 'test/status/hallo2' },
  ])
  const service = new MqttService(t.context.mqtt)

  return service.observe('test/hallo2').pipe(
    catchError(e => {
      t.is(e, `error subscribing \'test/status/hallo2\'`)
      subscribeStub.reset()
      return of()
    })
  )
})
test('Observe with error 2', t => {
  const subscribeStub = stub(t.context.mqtt, 'subscribe').yields(new Error(), [
    { qos: 128, topic: 'test/status/hallo2' },
  ])
  const service = new MqttService(t.context.mqtt)

  return service.observe('test/hallo2').pipe(
    catchError(e => {
      t.is(e, `subscription for \'test/status/hallo2\' rejected!`)
      subscribeStub.reset()
      return of()
    })
  )
})

test('can publish', t => {
  t.plan(2)
  t.context.mqtt.on('message', (topic: string, payload: Buffer) => {
    t.is(topic, 'test/hallo2')
    t.is(payload.toString(), '{"hello":"world"}')
  })

  const service = new MqttService(t.context.mqtt)
  service.publish('test/hallo2', { hello: 'world' }, { qos: 0, retain: false })
})

test.cb('can set', t => {
  t.context.mqtt.on(
    'message',
    (topic: string, payload: Buffer, packet: Ha4usMessage) => {
      t.is(topic, 'test/set/hallo2')
      t.is(payload.toString(), '{"hello":"world"}')
      t.is(packet.retain, false)
      t.end()
    }
  )

  const service = new MqttService(t.context.mqtt)
  service.set('test/hallo2', { hello: 'world' })
})

test.cb('can delete', t => {
  t.context.mqtt.on(
    'message',
    (topic: string, payload: Buffer, packet: Ha4usMessage) => {
      t.is(topic, 'test/status/hallo2')
      t.is(payload.length, 0)
      t.is(packet.retain, true)
      t.end()
    }
  )

  const service = new MqttService(t.context.mqtt)
  service.delete('test/hallo2')
})

test('can get', async t => {
  const service = new MqttService(t.context.mqtt)

  const subscription = service.observe('test/hallo2').subscribe()

  service.publish('test/status/hallo2', '0815', { qos: 0, retain: true })

  const answer = await service.get('test/hallo2')
  t.deepEqual(answer.topic, 'test/status/hallo2')
  t.deepEqual(answer.val, '0815')
  subscription.unsubscribe()
})

test('can get with emit get', async t => {
  const service = new MqttService(t.context.mqtt)

  const subscription = service.observe('test/hallo2').subscribe()

  service.publish('test/status/hallo2', '0815', { qos: 0, retain: true })
  const myspy = spy(t.context.mqtt, 'publish')

  const answer = await service.get('test/hallo2', {
    emitGet: true,
  })
  t.deepEqual(answer.topic, 'test/status/hallo2')
  t.deepEqual(answer.val, '0815')
  t.is(myspy.callCount, 1)
  t.is(myspy.firstCall.args[0], 'test/get/hallo2')
  t.is(myspy.firstCall.args[1], '')
  myspy.restore()

  const reconnectSpy = spy(t.context.mqtt, 'reconnect')
  service.reconnect()
  t.is(myspy.callCount, 1)
  subscription.unsubscribe()
})

test('command loop', async t => {
  const service = new MqttService(t.context.mqtt)
  service.domain = 'test'
  await service.command('test', query => {
    query.goodbye = 'earth'
    return query
  })

  const answer = await service.request('test/test', { hello: 'world' })
  t.deepEqual(answer.val, { hello: 'world', goodbye: 'earth' })
})

test.serial('command loop - timeout (in time)', async t => {
  const service = new MqttService(t.context.mqtt)
  service.domain = 'test'
  await service.command('test', async query => {
    return new Promise(resolve => {
      query.goodbye = 'earth'
      t.context.clock.setTimeout(() => {
        resolve(query)
      }, 1000)
    })
  })

  const promise = service
    .request('test/test', { hello: 'world' }, 2000)
    .then(answer => {
      t.deepEqual(answer.val, { hello: 'world', goodbye: 'earth' })
    })

  t.context.clock.tick(1000)
  return promise
})

test.serial.skip('command loop - timeout (too late)', async t => {
  const service = new MqttService(t.context.mqtt)
  await service.command('test', async query => {
    return new Promise(resolve => {
      query.goodbye = 'earth'
      t.context.clock.setTimeout(() => {
        resolve(query)
      }, 2000)
    })
  })

  const answer = service.request('test/test', { hello: 'world' }, 1000)

  t.context.clock.tick(20000)

  await t.throwsAsync(() => answer, /timeout/i)
})

test.serial('command timeout loop (no answer)', async t => {
  const service = new MqttService(t.context.mqtt)
  service.domain = 'test'

  const answer = service.request('test/test', { hello: 'world' }, 10000)
  t.context.clock.tick(11000)
  await t.throwsAsync(() => answer, /timeout/i)
})

test('observe multi pattern', t => {
  const service = new MqttService(t.context.mqtt)
  const obs = service.observe('/test1/hallo1', '/test/+', '/#').pipe(
    take(6),
    Ha4usOperators.pickTopic(),
    toArray()
  )
  obs.subscribe((topics: string[]) => {
    t.deepEqual(topics, [
      'test1/hallo1',
      'test1/hallo1',
      'test/hallo2',
      'test/hallo2',
      'test/hallo3',
      'test/hallo3',
    ])
  })

  t.context.mqtt.publish('test1/hallo1', '{"val":"helloworld","ts":12345}', {
    retain: false,
    qos: 0,
  })

  t.context.mqtt.publish('test/hallo2', '{"val":"helloworld","ts":12345}', {
    retain: false,
    qos: 0,
  })
  t.context.mqtt.publish('test/hallo3', '{"val":"helloworld","ts":12345}', {
    retain: false,
    qos: 0,
  })
})

test('observe latest', t => {
  const service = new MqttService(t.context.mqtt)
  const obs = service.observeLatest('/test1/hallo1', '/test/+').pipe(
    take(2),
    Ha4usOperators.pickEach('ts'),
    toArray()
  )
  obs.subscribe((msgs: any[]) => {
    t.deepEqual(msgs, [[1, 2], [1, 3]])
  })

  t.context.mqtt.publish('test1/hallo1', '{"val":"helloworld","ts":1}', {
    retain: false,
    qos: 0,
  })

  t.context.mqtt.publish('test/hallo2', '{"val":"helloworld","ts":2}', {
    retain: false,
    qos: 0,
  })
  t.context.mqtt.publish('test/hallo3', '{"val":"helloworld","ts":3}', {
    retain: false,
    qos: 0,
  })
})

test('observe latest without topic throws error', t => {
  const service = new MqttService(t.context.mqtt)

  const myFunc = () => service.observeLatest('#')
  const myFunc2 = () => service.observeLatest()

  t.throws(myFunc, 'observe latest must have a least two pattern')
  t.throws(myFunc2, 'observe latest must have a least two pattern')
})
