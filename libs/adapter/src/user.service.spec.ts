import anyTest, { serial, Macro, TestInterface } from 'ava'

import { TestMongo } from './test/mongo-db.mock'
import { Db } from 'mongodb'
import { LoggerMock } from './test/logger.mock'
import { useFakeTimers } from 'sinon'
import { UserService } from './user.service'
import { Ha4usUser } from '@ha4us/core'
interface Context {
  us: UserService
  mongo: TestMongo
  db: Db
}

const test = anyTest as TestInterface<Context>

test.before(t => {
  const testMongo = new TestMongo()
})

test.beforeEach(async t => {
  const mongo = new TestMongo()
  const db = await mongo.getDb()

  t.log(`Database ${mongo.getUrl()} created`)

  t.context = {
    us: new UserService(
      { secret: 'test', dbUrl: mongo.getUrl() },
      LoggerMock('test')
    ),
    mongo,
    db,
  }
  await t.context.us.connect()
})

test.afterEach(async t => {
  t.context.mongo.drop()
})

test('On instantiation creates an index', async t => {
  const indexes = t.context.us.collection.indexes()
  await indexes.then(data => {
    const userIndex = data.find(index => index.name === 'UniqueUsernames')
    t.is(userIndex.unique, true)
    t.deepEqual(userIndex.key, { username: 1 })
  })

  const us = new UserService(
    { secret: undefined, dbUrl: undefined },
    LoggerMock('test')
  )
})

test('Create an admin user', async t => {
  const adminUser = await t.context.us.createAdminUser('testpw')
  t.is(adminUser.username, 'admin')
  t.is(/^\{crypt\}/.test(adminUser.password), true)
  t.deepEqual(adminUser.roles, ['admin'])

  adminUser.fullName = 'Testadmin'
  adminUser.roles.push('guest')
  await t.context.us.put(adminUser)

  const adminUpdate = await t.context.us.createAdminUser('testpw2')
  t.is(adminUpdate.fullName, 'Testadmin')
  t.is(/^\{crypt\}/.test(adminUpdate.password), true)
  t.not(adminUser.password, adminUpdate.password)

  t.deepEqual(adminUpdate.roles, ['admin', 'guest'])

  const result = await t.context.us.verify('admin', 'testpw2')
  t.is(result.username, 'admin')

  await t.throwsAsync(t.context.us.verify('admin', 'testpw'), /^401/)
})

test('Posting,putting and getting users', async t => {
  const user1 = await t.context.us.post(new Ha4usUser('testuser'))
  t.is(/^\{crypt\}/.test(user1.password), true)
  t.is(user1.fullName, 'unnamed')

  await t.throwsAsync(t.context.us.post(new Ha4usUser('testuser')), /^409/)

  const user = await t.context.us.get('testuser')
  t.is(user.fullName, 'unnamed')
  user.fullName = 'test'
  const usernew = await t.context.us.put(user)
  t.is(usernew.fullName, 'test')
  let delUser = await t.context.us.delete(usernew.username)

  t.is(delUser, undefined)
  delUser = await t.context.us.delete(usernew.username)
  t.is(delUser, undefined)

  await t.throwsAsync(t.context.us.put(usernew), /^404/)
})

test('Getting multi users', async t => {
  const u1 = await t.context.us.post(new Ha4usUser('user1'))
  const u2 = await t.context.us.post(new Ha4usUser('user2'))

  const users = await t.context.us.get()

  t.is(users.length, 2)
})

test('Roles are defined', t => {
  t.deepEqual(UserService.roles, ['admin', 'user', 'guest', 'api'])
})

test('Check roles', async t => {
  const user1 = await t.context.us.post({
    username: 'testuser',
    roles: ['user', 'guest'],
  })
  t.is(UserService.checkRoles(user1, 'guest'), true)
  await t.throws(() => UserService.checkRoles(user1, 'api'), /^403/)
  t.is(UserService.checkRoles(user1, 'admin', 'user'), true)

  await t.throws(() => UserService.checkRoles(user1, 'admin'), /^403/)

  user1.roles.push('admin')
  t.is(UserService.checkRoles(user1, 'api'), true)
})

test('Tokens', async t => {
  let user = await t.context.us.post({
    username: 'longexpiry',
    password: 'test',
    roles: ['user', 'api'],
    tokenExp: 60 * 24 * 7, // one week in minutes
  })
  const clock = useFakeTimers()

  let token = t.context.us.createToken(user)
  t.is(typeof token, 'object')
  t.is(token.iat, 0)
  t.is(token.exp, 604800) // one week in seconds
  t.is(token.refresh, 600) // 600 seconds = 10 minutes

  user = await t.context.us.post({
    username: 'testuser',
    password: 'test',
    roles: ['user', 'api'],
  })

  delete user._id

  token = t.context.us.createToken(user)
  t.is(typeof token, 'object')
  t.deepEqual(token, {
    exp: 900,
    iat: 0,
    refresh: 600,
    user,
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      'eyJ1c2VyIjp7InVzZXJuYW1lIjoidGVzdHVzZXIiLCJyb2x' +
      'lcyI6WyJ1c2VyIiwiYXBpIl0sImZ1bGxOYW1lIjoidW5uYW1' +
      'lZCJ9LCJyZWZyZXNoIjo2MDAsImlhdCI6MCwiZXhwIjo5MDB9.' +
      'JAWz9Oww7HN-Gem_U1Bxew7scVoxDHlB17tcJKlHURM',
  })

  t.deepEqual(await t.context.us.isTokenValid(token.token), {
    exp: 900,
    iat: 0,
    refresh: 600,
    user,
    token: token.token,
  })

  clock.tick(1000 * 601)

  t.deepEqual(await t.context.us.isTokenValid(token.token), {
    exp: 1501,
    iat: 601,
    refresh: 1201,
    user,
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      'eyJ1c2VyIjp7InVzZXJuYW1lIjoidGVzdHVzZX' +
      'IiLCJyb2xlcyI6WyJ1c2VyIiwiYXBpIl0sImZ1' +
      'bGxOYW1lIjoidW5uYW1lZCJ9LCJyZWZyZXNoIjoxMjAxLCJpYXQiOjYwMSwiZXhwIjoxNTAxfQ.' +
      'tt0nPtpCgi7i5OzCi1dGcJMRQWvENLyDMqlfUVUP7SA',
  })

  const verified = await t.context.us.verify(token.token)
  delete verified._id

  t.deepEqual(verified, user)

  await t.context.us.delete(user.username)

  await t.throwsAsync(t.context.us.verify(token.token), /404/)

  clock.tick(1000 * 60 * 15 + 1)
  await t.throwsAsync(t.context.us.verify(token.token), /403/)

  clock.uninstall()
})
