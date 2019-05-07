import { serial as test } from 'ava';

import {
  ADAPTER_OPTIONS,
  ADAPTER_OPTIONS2,
  AdapterMockFactory,
} from './test/adapter.mock';

import { ha4us } from './adapter';

test('Create adapter', async t => {
  const cb = () => {
    throw new Error('intendend test problem');
  };
  await ha4us(ADAPTER_OPTIONS, AdapterMockFactory(cb));

  t.pass();
});

test('Create 2nd adapter', async t => {
  return ha4us(ADAPTER_OPTIONS2, AdapterMockFactory()).then(() => {
    t.pass();
  });
});
