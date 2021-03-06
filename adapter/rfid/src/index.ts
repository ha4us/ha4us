import {
  CreateObjectMode,
  ha4us,
  ObjectService,
  StateService,
} from '@ha4us/adapter'
import { Ha4usLogger, Ha4usObjectType, MqttUtil } from '@ha4us/core'
import { createRfid, RFIDReader } from '@ulfalfa/rfid'
import { Subscription } from 'rxjs'

const ADAPTER_OPTIONS = {
  name: 'rfid',
  path: __dirname + '/..',
  args: {
    reader: {
      alias: 'r',
      demandOption: true,
      describe: 'type of reader (chafon or d302)',
      default: 'd302',
      type: 'string',
    },
    port: {
      alias: 'p',
      demandOption: true,
      describe: 'Serial Port of reader',
      default: '/dev/ttyUSB0',
      type: 'string',
    },
    interval: {
      alias: 'i',
      demandOption: false,
      describe: 'Reading intervall',
      type: 'number',
    },
  },
  logo: 'rfid.png',
  imports: ['$log', '$args', '$states', '$objects', '$media'],
}

function Adapter(
  $log: Ha4usLogger,
  $args: any,
  $states: StateService,

  $objects: ObjectService
) {
  let reader: RFIDReader
  let sub: Subscription
  async function $onInit() {
    await $objects
      .create(
        [
          {
            role: 'device/rfidreader',
            can: { read: false, write: false, trigger: false },
            native: { reader: $args.rfidReader, port: $args.rfidPort },
          },
          {
            tag: {
              role: 'value/rfidtag',
              type: Ha4usObjectType.String,
              can: { read: false, write: false, trigger: true },
            },
            info: {
              role: 'value/rfidreaderinfo',
              type: Ha4usObjectType.String,
              can: { read: false, write: false, trigger: true },
            },
          },
        ],
        { root: MqttUtil.join('$', 'reader') }
      )
      .toPromise()

    $states.connected = 2

    reader = createRfid($args.rfidReader, $args.rfidPort)
    await reader.open()

    const info = await reader.getInfo()
    $states.status('$reader/info', info, true)
    $log.debug('Reader connected', info)
    sub = reader.observe().subscribe(data => {
      $log.debug('Tag read', data)
      $states.status('$reader/tag', data, false)
    })

    return true
  }

  async function $onDestroy() {
    reader.close()
  }

  return {
    $onInit,
    $onDestroy,
  }
}

ha4us(ADAPTER_OPTIONS, Adapter).catch(e => {
  console.error('Adapter crashed', e)
})
