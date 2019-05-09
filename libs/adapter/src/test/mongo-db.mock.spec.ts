import { serial as test } from 'ava'
import { Db } from 'mongodb'
import { TestMongo } from './mongo-db.mock'

test('Initialize', t => {
  let mongotest = new TestMongo()
  t.is(mongotest.mongoUrl, 'mongodb://localhost:27017')
  t.is(mongotest.dbPrefix, 'mongo-mock')

  mongotest = new TestMongo('test1', 'test2')
  t.is(mongotest.mongoUrl, 'test1')
  t.is(mongotest.dbPrefix, 'test2')
})

test('can create a database url', t => {
  const mongotest = new TestMongo()

  const dbUrl = mongotest.getUrl()
  t.is(mongotest.DBURL.test(dbUrl), true)

  const dbUrl2 = mongotest.getUrl()
  t.is(dbUrl, dbUrl2)
})

test('can create a database', async t => {
  const mongotest = new TestMongo()

  const db = await mongotest.getDb()

  t.regex(db.databaseName, /mongo-mock-.*/)
  t.is(db instanceof Db, true)
})

test('can drop current database', async t => {
  const mongotest = new TestMongo()

  const db = await mongotest.getDb()
  await db.collection('first').insertOne({ hello: 'world' })

  await mongotest.drop()

  const databases = await mongotest.listAll()

  t.pass()
})

test.skip('can list all existing test dbs', async t => {
  const mongotest = new TestMongo()

  let db = await mongotest.getDb()
  await db.collection('first').insertOne({ hello: 'world' })

  const mongotest2 = new TestMongo()
  db = await mongotest2.getDb()
  await db.collection('first').insertOne({ hello: 'world2' })

  const databases = await mongotest.listAll()

  await mongotest.dropAll()

  t.is(databases.length, 2)
})

test.skip('can drop all', async t => {
  const mongotest = new TestMongo()

  let db = await mongotest.getDb()
  await db.collection('first').insertOne({ hello: 'world' })
  const mongotest2 = new TestMongo()
  db = await mongotest2.getDb()
  await db.collection('first').insertOne({ hello: 'world2' })

  const drops = await mongotest2.dropAll()
  t.deepEqual(drops, [true, true])
  const databases = await mongotest.listAll()

  t.is(databases.length, 0)
})
