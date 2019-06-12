import { Subject, Subscription, from, of, never } from 'rxjs'

import {
  mergeMap,
  switchMap,
  map,
  toArray,
  delay,
  catchError,
  filter,
  onErrorResumeNext,
} from 'rxjs/operators'

import {
  ha4us,
  StateService,
  ObjectService,
  CreateObjectMode,
  DBMediaService,
  MediaService,
  // EventService,
} from '@ha4us/adapter'
import {
  Ha4usError,
  Ha4usRole,
  MqttUtil,
  Ha4usObject,
  Ha4usObjectType,
} from '@ha4us/core'

import { Landroid } from './landroid'

const ADAPTER_OPTIONS = {
  name: 'landroid',
  path: __dirname + '/..',
  logo: 'assets/landroid-logo.png',
  args: {
    ip: {
      demandOption: true,
      describe: 'id of the landroid api',
      type: 'string',
      alias: 'ip',
    },
    pin: {
      demandOption: true,
      describe: 'pin for accessing the api',
      type: 'string',
      alias: 'pin',
    },
    poll: {
      demandOption: false,
      default: 5,
      describe: 'polling intervall in sec.',
      type: 'number',
    },
  },
  imports: ['$log', '$args', '$states', '$objects'],
}

function Adapter(
  $log,
  $args,
  $states: StateService,

  $objects: ObjectService
) {
  async function $onInit() {
    //  `http://${$args.landroidIp}:80/jsondata.cgi`,

    const landi = new Landroid($args.landroidIp, $args.landroidPin)

    const res = await $objects
      .create(
        [
          { role: 'Device/Landroid' }, // root object $/landroid
          {
            battery: {
              role: 'Value/System/Battery',
              type: Ha4usObjectType.Number,
              can: { trigger: true },
            },
            state: {
              role: 'Mode/Landroid/State',
              type: Ha4usObjectType.String,
              can: { trigger: true },
            },
            error: {
              role: 'Value/Landroid/Errortext',
              type: Ha4usObjectType.String,
              can: { trigger: true },
            },
            start: {
              role: 'Action/PressShort',
              type: Ha4usObjectType.Boolean,
              can: { write: true },
            },
            stop: {
              role: 'Action/PressShort',
              type: Ha4usObjectType.Boolean,
              can: { write: true },
            },
          },
        ],

        { mode: 'update', root: '$/landroid' }
      )
      .toPromise()

    $log.info(`${res.updated} Objects updated. ${res.inserted} created`)

    landi.observe().subscribe(data => {
      if (typeof data === 'string') {
        $states.status('$landroid/error', data, true)
      } else {
        $log.debug('Work req', data.data.workReq)
        $states.status(
          '$landroid/battery',
          data.debug.landroid.battery.percentage,
          true
        )
        $states.status('$landroid/state', data.debug.landroid.state, true)
        $states.status(
          '$landroid/error',
          data.data.message !== 'none' ? data.data.message : '',
          true
        )
      }
    })

    $states
      .observe('/$set/landroid/start')
      .pipe(filter(msg => msg.val === true || msg.val === 'true'))
      .subscribe(msg => {
        landi.start().catch(e => {
          $states.status('$landroid/error', `not reachable`, true)
        })
      })

    $states
      .observe('/$set/landroid/stop')
      .pipe(filter(msg => msg.val === true || msg.val === 'true'))
      .subscribe(msg => {
        landi.stop().catch(e => {
          $states.status('$landroid/error', `not reachable`, true)
        })
      })

    $states.connected = 2

    return true
  }

  return {
    $onInit,
  }
}

ha4us(ADAPTER_OPTIONS, Adapter)
