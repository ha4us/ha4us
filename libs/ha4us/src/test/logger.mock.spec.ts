import { test } from 'ava';

import { LoggerMock } from './Logger.mock';

test.only('Create a test logger', (t) => {
  const logger = LoggerMock('test');
  t.is(typeof logger, 'object');
  t.is(logger.hasOwnProperty('debug'), true);
  t.is(logger.hasOwnProperty('error'), true);
  t.is(logger.hasOwnProperty('warn'), true);
  t.is(logger.hasOwnProperty('info'), true);
});
