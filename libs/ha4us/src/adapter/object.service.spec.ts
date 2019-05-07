import anyTest, { serial, Macro, TestInterface } from 'ava';

import { TestMongo } from '../test/mongo-db.mock';
import { Db } from 'mongodb';
import { LoggerMock } from '../test/logger.mock';

import { take, map, toArray } from 'rxjs/operators';

import { ObjectService } from './object.service';
import { Ha4usObjectType } from '../core';
interface Context {
  os: ObjectService;
  mongo: TestMongo;
  db: Db;
}

const test = anyTest as TestInterface<Context>;

test.before(t => {
  const testMongo = new TestMongo();
});

test.beforeEach(async t => {
  const mongo = new TestMongo();
  const db = await mongo.getDb();

  t.log(`Database ${mongo.getUrl()} created`);

  t.context = {
    os: new ObjectService(LoggerMock('test'), {
      dbUrl: mongo.getUrl(),
      name: 'test',
    }),
    mongo,
    db,
  };
  await t.context.os.connect();
});

test.afterEach(async t => {
  t.context.mongo.drop();
});

test('On instantiation creates an index', async t => {
  const col = await t.context.os.collection;
  const indexes = col.indexes();
  return indexes.then(data => {
    const topicIndex = data.find(index => index.name === 'UniqueTopic');
    t.is(topicIndex.unique, true);
    t.deepEqual(topicIndex.key, { topic: 1 });
  });
});

test('Post an object', async t => {
  await t.throws(t.context.os.post({}), '400 - topic is mandatory');

  const result = await t.context.os.post({ topic: 'hello/world' });
  t.is(result.topic, 'hello/world');
  t.is(result.type, Ha4usObjectType.Any);

  await t.throws(t.context.os.post({ topic: 'hello/world' }), /^409 - /);
});

test('Putting an object', async t => {
  const myObject = await t.context.os.post({ topic: 'hello/world' });

  myObject.type = Ha4usObjectType.String;
  let resultingObject = await t.context.os.put(myObject);
  t.is(resultingObject._id, myObject._id);
  t.is(resultingObject.type, 'string');

  resultingObject = await t.context.os.put(myObject, 'hello/world');
  t.is(resultingObject._id, myObject._id);
  t.is(resultingObject.type, 'string');

  await t.throws(
    t.context.os.put(resultingObject, 'not/existing'),
    /404 - not found/
  );
});

test('Getting an object', async t => {
  await t.throws(t.context.os.getOne('not/existing'), /404 - object not found/);
  let result = await t.context.os.get({ pattern: '#' });
  t.is(result.length, 0);

  const obj1 = await t.context.os.post({
    topic: 'hello/world',
    tags: ['test', 'another'],
  });
  const obj2 = await t.context.os.post({ topic: 'hello/earth' });

  const singleResult = await t.context.os.getOne('hello/world');
  t.deepEqual(singleResult, obj1);
  result = await t.context.os.get({ pattern: 'hello/#' });
  t.deepEqual(result, [obj2, obj1]);

  result = await t.context.os.get({ tags: ['test'] });

  t.deepEqual(result, [obj1]);
});

test('Getting paged objects', async t => {
  for (let i = 0; i < 20; i++) {
    await t.context.os.post({ topic: 'test/' + i });
  }

  let result = await t.context.os.get({ pattern: '#' }, 1, 10);

  t.is(result.page, 1);
  t.is(result.pages, 2);
  t.is(result.length, 20);
  t.is(result.data.length, 10);

  result = await t.context.os.get({ pattern: '#' }, 2, 10);

  t.is(result.page, 2);
  t.is(result.pages, 2);
  t.is(result.length, 20);
  t.is(result.data.length, 10);

  result = await t.context.os.get({ pattern: '#' }, 7, 3);

  t.is(result.page, 7);
  t.is(result.pages, 7);
  t.is(result.length, 20);
  t.is(result.data.length, 2);
});

test('Observe', async t => {
  for (let i = 0; i < 5; i++) {
    await t.context.os.post({ topic: 'test/' + i });
  }

  const myarr = await t.context.os
    .observe({ pattern: '#' })
    .pipe(toArray())
    .toPromise();

  t.is(myarr.length, 5);
});

test('Deleting', async t => {
  const result = await t.context.os.post({ topic: 'test/todelete' });
  let deleted = await t.context.os.delete('test/todelete');
  t.deepEqual(deleted, result);
  deleted = await t.context.os.delete('test/todelete');
  t.is(deleted, undefined);
});

test('Events', async t => {
  let myObj: any;
  const obs = t.context.os.events$
    .pipe(
      take(3),
      toArray()
    )
    .toPromise();

  myObj = await t.context.os.post({ topic: 'events/test' });
  let myObjUpdate = await t.context.os.getOne('events/test');
  myObjUpdate.label = 'UPDATE';
  myObjUpdate = await t.context.os.put(myObjUpdate);
  const myObjDelete = await t.context.os.delete(myObjUpdate.topic);

  const result = await obs;
  t.deepEqual(result, [
    { action: 'insert', object: myObj },
    { action: 'update', object: myObjUpdate },
    { action: 'delete', object: myObjDelete },
  ]);
});

test.todo('Getting all tags');
test.todo('Autocomplete');

test.todo('Install new objects');
