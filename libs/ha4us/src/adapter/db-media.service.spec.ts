import anyTest, { serial, Macro, TestInterface } from 'ava'
import { Db } from 'mongodb'

import * as Debug from 'debug'

const debug = Debug('ha4us:test')

import { createReadStream } from 'fs'
import { TestMongo } from '../test/mongo-db.mock'
import { LoggerMock } from '../test/logger.mock'

import { ObjectId } from 'mongodb'

import { DBMediaService, mediaToFile } from './db-media.service'

import * as lolex from 'lolex'

const ADAY = 1000 * 60 * 60 * 24

const RASTER_FILE = 'src/test/assets/rasterimage.jpg'

interface Context {
    ms: DBMediaService
    mongo: TestMongo
    clock: lolex.Clock
}

const test = serial as TestInterface<Context>

test.before(t => {
    const testMongo = new TestMongo()
    return testMongo.dropAll()
})

test.beforeEach(async t => {
    const testmongo = new TestMongo()
    const db = await testmongo.getDb()

    t.log(`Database ${testmongo.getUrl()} created`)
    t.context = {
        ms: new DBMediaService(LoggerMock('test'), {
            dbUrl: testmongo.getUrl(),
        }),
        mongo: testmongo,
        clock: lolex.install(),
    }
    await t.context.ms.connect()
})

test.afterEach(async t => {
    t.context.mongo.drop()
    t.context.clock.uninstall()
})

test('Media2File', t => {
    const file = mediaToFile('test.txt', { contentType: 'test/txt' })
    t.deepEqual(file, {
        content_type: 'test/txt',
        mode: 'w',
        filename: 'test.txt',
        metadata: {
            description: '',
            expires: undefined,
            owner: 'system',
            tags: [],
        },
    })
})

test('Put and get a file to db', async t => {
    const ms = t.context.ms

    t.pass()

    const info = await ms.postFile(RASTER_FILE, {
        contentType: 'image/jpeg',
        tags: ['test'],
        owner: 'test',
        description: 'test',
        dtl: 1,
    })

    t.is(typeof info.id, 'string')
    t.is(info.urn, 'urn:ha4us:media:' + info.id)
    t.is(info.filename, 'src/test/assets/rasterimage.jpg')
    t.is(info.contentType, 'image/jpeg')
    t.is(info.length, 365047)
    t.is(info.owner, 'test')
    t.is(info.uploadDate.valueOf(), 0)
    t.is(info.expires.valueOf(), 1000 * 60 * 60 * 24)
    t.deepEqual(info.tags, ['test'])
    t.is(info.md5, '3334f63e6edbd6a85b8057b52ae0cd4b')

    let info2 = await ms.getByFilename('src/test/assets/rasterimage.jpg')
    t.is(typeof info2.id, 'string')
    t.is(info2.filename, 'src/test/assets/rasterimage.jpg')
    t.is(info2.contentType, 'image/jpeg')
    t.is(info2.length, 365047)
    t.is(info2.owner, 'test')
    t.is(info2.uploadDate.valueOf(), 0)
    t.is(info2.expires.valueOf(), 1000 * 60 * 60 * 24)
    t.deepEqual(info2.tags, ['test'])
    t.is(info2.md5, '3334f63e6edbd6a85b8057b52ae0cd4b')

    info2 = await ms.getById(info.id)
    t.is(typeof info2.id, 'string')
    t.is(info2.filename, 'src/test/assets/rasterimage.jpg')
    t.is(info2.contentType, 'image/jpeg')
    t.is(info2.length, 365047)
    t.is(info2.owner, 'test')
    t.is(info2.uploadDate.valueOf(), 0)
    t.is(info2.expires.valueOf(), 1000 * 60 * 60 * 24)
    t.deepEqual(info2.tags, ['test'])
    t.is(info2.md5, '3334f63e6edbd6a85b8057b52ae0cd4b')
})

test('Delete an item', async t => {
    const ms = t.context.ms

    const info = await ms.postFile(RASTER_FILE, {
        tags: ['test'],
        owner: 'test',
        description: 'test',
        dtl: 1,
    })

    await ms.delete(info.id)

    return t.throws(
        ms.getById(info.id),
        '404 - media ' + info.id + ' not found'
    )
})

test.only('Puts an asset from web', async t => {
    const ms = t.context.ms
    const info = await ms.postUrl('https://dummyimage.com/600x400', {
        tags: ['test'],
        owner: 'test',
    })

    t.is(typeof info.id, 'string')
    t.is(info.filename, 'https://dummyimage.com/600x400')
    t.is(info.contentType, 'image/png')
    t.is(info.owner, 'test')
    t.is(info.uploadDate.valueOf(), 0)
    t.is(info.expires, undefined)
    t.deepEqual(info.tags, ['test'])
})

test('Get media with empty database', async t => {
    const ms = t.context.ms

    let myResult = await ms.get('*')
    t.deepEqual(myResult, [])

    myResult = await ms.get('*', [])
    t.deepEqual(myResult, [])

    let myPagedResult = await ms.get('*', [], 2)
    t.deepEqual(myPagedResult, {
        data: [],
        length: 0,
        page: 1,
        pageSize: 10,
        pages: 0,
    })
    myPagedResult = await ms.get('*', [], 2, 3)
    t.deepEqual(myPagedResult, {
        data: [],
        length: 0,
        page: 1,
        pageSize: 3,
        pages: 0,
    })
})

test('Get media with filled database', async t => {
    const ms = t.context.ms

    await ms.postFile(RASTER_FILE, {
        contentType: 'image/jpeg',
        tags: ['test1', 'test'],
        owner: 'test',
    })
    await ms.postUrl('https://dummyimage.com/600x400', {
        tags: ['test1'],
        owner: 'test',
    })
    const result = await ms.postUrl('https://www.google.de', {
        tags: ['test2', 'test'],
        owner: 'test',
    })

    t.deepEqual(result.tags, ['test2', 'test'])

    let myResult = await ms.get('*')
    t.is(myResult.length, 3)

    let myPagedResult = await ms.get('*', [], 2, 2)
    t.is(myPagedResult.page, 2)
    t.is(myPagedResult.length, 3)
    t.is(myPagedResult.pageSize, 2)
    t.is(myPagedResult.pages, 2)
    myPagedResult = await ms.get('*', [], 1, 2)
    t.is(myPagedResult.page, 1)
    t.is(myPagedResult.length, 3)
    t.is(myPagedResult.pageSize, 2)
    t.is(myPagedResult.pages, 2)

    myPagedResult = await ms.get('*', [], 1)
    t.is(myPagedResult.page, 1)
    t.is(myPagedResult.length, 3)
    t.is(myPagedResult.pageSize, 10)
    t.is(myPagedResult.pages, 1)

    myResult = await ms.get('image/*', [])
    t.is(myResult.length, 2)

    myResult = await ms.get('text/html', [])
    t.is(myResult.length, 1)

    myResult = await ms.get('*', ['test'])
    t.is(myResult.length, 2)

    myResult = await ms.get('*', ['test2'])
    t.is(myResult.length, 1)
    myResult = await ms.get('text/html', ['test1'])
    t.is(myResult.length, 0)
})

test('Expiry', async t => {
    const ms = t.context.ms

    const id = '1234567890ABCDEF12345678'
    let obj = await ms.postFile(RASTER_FILE, {
        id,
        contentType: 'image/jpeg',
        tags: ['test1', 'test'],
        owner: 'test',
        dtl: 1,
    })

    t.is(obj.id, id.toLowerCase())

    t.throws(
        ms.postFile(RASTER_FILE, {
            id,
            contentType: 'image/jpeg',
            tags: ['test1', 'test'],
            owner: 'test',
            dtl: 1,
        }),
        /409/
    )
    obj = await ms.postUrl('https://dummyimage.com/600x400', {
        id: 'HA4US_123456',
        tags: ['test1'],
        owner: 'test',
        dtl: 2,
    })

    t.is(obj.id, new ObjectId('HA4US_123456').toHexString())
    await ms.postUrl('https://www.google.de', {
        tags: ['test2', 'test'],
        owner: 'test',
    })

    t.context.clock.tick(ADAY + 1)

    let result = await ms.expire()

    t.is(result, 1)
    t.context.clock.tick(1000 * 60 * 60 * 24)

    result = await ms.expire()
    t.is(result, 1)

    const stillThere = await ms.get('*')

    t.is(stillThere.length, 1)
})

test('Import of path', async t => {
    const ms = t.context.ms
    let result = await ms.import('assets/**/*', __dirname + '/../test')

    console.log(result)
    t.is(result.count, 3)
    t.is(result.imported.length, 3)

    result = await ms.import('assets/**/*.jpg', __dirname + '/../test')
    console.log(result)
    t.is(result.count, 1)
    t.is(result.imported.length, 0)
})
test('Mass deletion', async t => {
    const ms = t.context.ms
    await ms.import('assets/**/*', __dirname + '/../test')

    await ms.delete('image/*', ['#assets'])
    let reading = await ms.get('*')
    t.is(reading.length, 1)

    await ms.delete('*')
    reading = await ms.get('*')
    t.is(reading.length, 0)
})
