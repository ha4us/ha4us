import test from 'ava'

import { Ha4usUser } from './user'

test('Can initialize via constructor', t => {
    let user = new Ha4usUser('test')

    t.deepEqual(user.roles, [])

    user = new Ha4usUser('test', ['admin'])

    t.deepEqual(user.roles, ['admin'])
})
