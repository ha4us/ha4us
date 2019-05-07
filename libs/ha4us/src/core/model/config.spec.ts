import { test } from 'ava'

import { Ha4usConfigObject, Ha4usConfig } from './config'

const CONFIG: Ha4usConfig<any> = {
  topic: 'test',
  type: 'string',
  value: {},
}

test('Can initialize via constructor', t => {
  let config = new Ha4usConfigObject(CONFIG)

  t.is(config.topic, 'ha4us/config/system/test')

  config = new Ha4usConfigObject(CONFIG, 'test')

  t.is(config.topic, 'ha4us/config/user/test/test')
})
