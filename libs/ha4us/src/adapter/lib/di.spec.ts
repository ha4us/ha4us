import { test } from 'ava'

import { DIContainer } from './di'

test.skip('Service Decorator', t => {
    //
    // @service('testservice')
    class TestClass {
        constructor(protected test1: string, test2: boolean, test3: number) {}
    }

    t.pass()
})

test.serial('Singleton', async t => {
    let container = new DIContainer()
    let cont2 = new DIContainer()
    t.not(container, cont2)

    container = DIContainer.getContainer()
    t.throws(
        () => new DIContainer(),
        /singleton - please user DIContainer.getContainer()/
    )

    cont2 = DIContainer.getContainer()
    t.is(container, cont2)

    cont2.destroy()
})

test('Register Value with token', t => {
    const cont = new DIContainer()
    const TOKEN = Symbol('token')
    const value = 'HELLO WORLD'
    cont.registerValue(TOKEN, value)

    const result = cont.resolve(TOKEN)

    t.is(value, result)
})

test('Register function', t => {
    const cont = new DIContainer()
    cont.registerValue('data', 'HELLO')

    function stringFactory(data: string): string {
        return data + ' world'
    }

    cont.registerFactory('fn', stringFactory)

    let result = cont.resolve('fn')
    t.is(result, 'HELLO world')

    cont.registerValue('data', 'GOODBYE')
    result = cont.resolve('fn')

    //factory is always a singleton
    t.is(result, 'HELLO world')
})

test('register class', t => {
    const cont = new DIContainer()

    cont.registerValue('_data', 'HELLO')
    function testfn(data: string) {}

    class TestClass {
        public get data() {
            return this._data + ' WORLD'
        }
        constructor(protected _data: string) {}
    }
    cont.registerService('testclass', TestClass)

    const result: TestClass = cont.resolve('testclass')

    t.is(result.data, 'HELLO WORLD')

    const cradle = Object.keys(cont.cradle)
    t.deepEqual(cradle, ['_data', 'testclass'])
})
