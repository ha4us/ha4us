import { test } from 'ava';

import { YamlService } from './yaml.service';
import { LoggerMock } from './test/logger.mock';

const TESTDATA = {
  hello: 'world',
};

test('Can read a file', async t => {
  const logger = LoggerMock('test');

  const ys = new YamlService(logger);

  let result = await ys.load('src/test/testfile.yml');

  t.deepEqual(result, TESTDATA);

  result = await ys.load('./test/testfile.yml', __dirname);

  t.deepEqual(result, TESTDATA);
});

test('Can store a file', async t => {
  const logger = LoggerMock('test');

  const ys = new YamlService(logger);

  const result = await ys.save(TESTDATA, './test/testfile.yml', {
    filePath: __dirname,
  });

  t.is(result, undefined);
});
