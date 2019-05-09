import anyTest, { serial, Macro, TestInterface } from 'ava'

import { TestMongo } from '../test/mongo-db.mock'
import { Db, Collection } from 'mongodb'

import { Ha4usMongoAccess } from './ha4us-mongo-access'

const testMongo = new TestMongo()
type Context = any

const test = anyTest as TestInterface<Context>

test('Simple access without collection', async t => {
  const dbUrl = testMongo.getUrl()

  const ma = new Ha4usMongoAccess(dbUrl)

  t.throws(() => ma.db, /database not connected/)

  await ma.connect()

  t.is(ma.db instanceof Db, true)

  const ma2 = new Ha4usMongoAccess(dbUrl)

  await ma.connect()

  t.is(ma.db, ma2.db)
})

test('Simple access with collection', async t => {
  const dbUrl = testMongo.getUrl()

  const ma = new Ha4usMongoAccess(dbUrl, 'test')

  await ma.connect()

  const result = await ma.collection.insertOne({ hello: 'word' })

  t.is(result.insertedCount, 1)

  t.is(ma.collection.collectionName, 'test')
})
