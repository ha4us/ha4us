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
  Ha4usLogger,
  Ha4usObjectType,
} from '@ha4us/core'

import { createRfid, RFIDReader } from '@ulfalfa/rfid'

import * as path from 'path'
import * as fs from 'fs'
// import * as watch from 'watch';

import * as chokidar from 'chokidar'

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
  imports: ['$log', '$args', '$states', '$objects'],
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
    await $objects.install(
      null,
      { role: 'adapter/rfid' },
      CreateObjectMode.create
    )

    await $objects.install(
      'reader',
      {
        role: 'device/rfidreader',
        can: { read: false, write: false, trigger: false },
        native: { reader: $args.rfidReader, port: $args.rfidPort },
      },
      CreateObjectMode.create
    )

    await $objects.install(
      'reader/tag',
      {
        role: 'value/rfidtag',
        type: Ha4usObjectType.String,
        can: { read: false, write: false, trigger: true },
      },
      CreateObjectMode.create
    )

    await $objects.install(
      'reader/info',
      {
        role: 'value/rfidreaderinfo',
        type: Ha4usObjectType.String,
        can: { read: false, write: false, trigger: true },
      },
      CreateObjectMode.create
    )

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
