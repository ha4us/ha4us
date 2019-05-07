import { Ha4usOptions, AdapterFactory, Ha4usAdapter } from '../adapter'

import { TestMongo } from './mongo-db.mock'

const dbUrl = new TestMongo().getUrl()

export const ADAPTER_OPTIONS: Ha4usOptions = {
    name: 'test1',
    path: __dirname + '/../..',
    args: {
        secret: {
            alias: 'secret',
            demandOption: false,
            describe: 'the secret for the token generation',
            type: 'string',
        },
    },
    imports: [
        '$args',
        '$log',
        //'$maps',
        '$media',
        '$yaml',
        '$states',
        '$objects',
        '$users',
        '$injector',
        //'$config',
        '$options',
        '$os',
    ],
}
export const ADAPTER_OPTIONS2: Ha4usOptions = {
    name: 'test2',
    path: __dirname + '/../..',
    args: {},
}

process.env['HA4US_DB_URL'] = dbUrl

export function AdapterMockFactory(cb?: () => void): AdapterFactory {
    return function AdapterMock($log, $args, $states): Ha4usAdapter {
        async function $onInit(): Promise<boolean> {
            $log.info('Starting test adapter')
            if ($states) {
                $states.connected = 2
            }

            if (cb) {
                cb()
            } else {
                return false
            }
        }

        async function $onDestroy() {
            $log.info('Destroying', $args.name)
        }

        return {
            $onInit: $onInit,
            $onDestroy: $onDestroy,
        }
    }
}
