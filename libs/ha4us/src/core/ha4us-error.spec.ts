import { test } from 'ava';
import { MongoError } from 'mongodb';
import { Ha4usError } from './ha4us-error';

test('Can initialize via constructor without error', t => {
  const error = new Ha4usError(500, 'server');

  t.is(error.code, 500);
  t.is(error.message, '500 - server');
  t.is(error.orig, undefined);
});

test('Can initialize via constructor with error', t => {
  const e = new Error('test');
  const error = new Ha4usError(500, 'server', e);
  t.truthy(error instanceof Error);
  t.is(error.code, 500);
  t.is(error.message, '500 - server (test)');
  t.is(error.orig, e);
  const error2 = new Ha4usError(500, 'server');
  t.is(error2.code, 500);
  t.is(error2.message, '500 - server');
});

test('Can initialize via static with error', t => {
  const e = new Error('test');
  const error = Ha4usError.generateError(500, 'server', e);

  t.is(error.code, 500);
  t.is(error.message, '500 - server (test)');
  t.is(error.orig, e);
});

test('Can initialize via static without error', t => {
  const error = Ha4usError.generateError(500, 'server');

  t.is(error.code, 500);
  t.is(error.message, '500 - server');
  t.is(error.orig, undefined);
});

test('Can wrap an mongo error', t => {
  const e = new MongoError('test');
  e.code = 11000;
  function throwError() {
    Ha4usError.wrapErr(e);
  }

  t.throws(throwError, '409 - object already exists (test)');
});

test('Can wrap an enoent error', t => {
  const e = new Error('ENOENT');
  e['code'] = 'ENOENT';
  function throwError() {
    Ha4usError.wrapErr(e);
  }

  t.throws(throwError, '404 - file not found (ENOENT)');
});

test('Can wrap an HttpErrorResponse error', t => {
  const e = new Error('HTTP');
  e['name'] = 'HttpErrorResponse';
  e['status'] = 123;
  function throwError() {
    Ha4usError.wrapErr(e);
  }

  t.throws(throwError, '123 - HTTP (HTTP)');
});

test('Can wrap an unknown error', t => {
  const e = new Error('Unknown');

  function throwError() {
    Ha4usError.wrapErr(e);
  }

  t.throws(throwError, '500 - server error (Unknown)');
});

test('Ha4usError custom fields', t => {
  const err = new Error('Unknown');

  try {
    Ha4usError.wrapErr(err);
  } catch (e) {
    t.is((<Ha4usError>e).code, 500);
    t.deepEqual((<Ha4usError>e).orig, err);
  }
});
