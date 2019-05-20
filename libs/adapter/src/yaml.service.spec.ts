import { serial as test } from 'ava'

import { YamlService } from './yaml.service'
import { LoggerMock } from './test/logger.mock'

const TESTDATA = {
  hello: 'world',
}

test('Can read a file', async t => {
  const logger = LoggerMock('test')

  const ys = new YamlService(logger)

  const file = __dirname + '/test/testfile.yml'

  t.log('Loading', file)

  let result = await ys.load(file)

  t.log('Result', result)
  t.deepEqual(result, TESTDATA)

  result = await ys.load('./test/testfile.yml', __dirname)

  t.deepEqual(result, TESTDATA)
})

test('Can store a file', async t => {
  const logger = LoggerMock('test')

  const ys = new YamlService(logger)

  const result = await ys.save(TESTDATA, __dirname + '/test/testfile.yml', {
    filePath: __dirname,
  })

  t.is(result, undefined)
})
