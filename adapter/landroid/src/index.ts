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

    await $objects.install(
      null,
      { role: 'adapter/landroid' },
      CreateObjectMode.create
    )

    await $objects.install(
      'landroid',
      { role: 'Device/Landroid' },
      CreateObjectMode.create
    )

    await $objects.install(
      'landroid/battery',
      {
        role: 'Value/System/Battery',
        type: Ha4usObjectType.Number,
        can: { read: false, write: false, trigger: true },
      },
      CreateObjectMode.create
    )
    await $objects.install(
      'landroid/state',
      {
        role: 'Mode/Landroid/State',
        type: Ha4usObjectType.String,
        can: { read: false, write: false, trigger: true },
      },
      CreateObjectMode.create
    )
    await $objects.install(
      'landroid/error',
      {
        role: 'Value/Landroid/Errortext',
        type: Ha4usObjectType.String,
        can: { read: false, write: false, trigger: true },
      },
      CreateObjectMode.create
    )

    await $objects.install(
      'landroid/start',
      {
        role: 'Action/PressShort',
        type: Ha4usObjectType.Boolean,
        can: { read: false, write: true, trigger: true },
      },
      CreateObjectMode.create
    )
    await $objects.install(
      'landroid/stop',
      {
        role: 'Action/PressShort',
        type: Ha4usObjectType.Boolean,
        can: { read: false, write: true, trigger: true },
      },
      CreateObjectMode.create
    )

    landi.observe().subscribe(data => {
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
    })

    $states
      .observe('/$set/landroid/start')
      .pipe(filter(msg => msg.val === true || msg.val === 'true'))
      .subscribe(msg => {
        landi.start()
      })

    $states
      .observe('/$set/landroid/stop')
      .pipe(filter(msg => msg.val === true || msg.val === 'true'))
      .subscribe(msg => {
        landi.stop()
      })

    /* publish('distance', data.distance);
    publish('battery/state', data.batteryChargerState );
    publish('battery/percentage',debug.landroid.battery.percentage);
    publish('work_request', data.workReq);
    publish('error', data.message);
    publish('firmware', data.versione_fw);
    publish('waitAfterRain', data.rit_pioggia );
    publish('rain', debug.landroid.rainSensor );
    publish('area/total', data.num_aree_lavoro);
    publish('area/current', data.area);
    publish('area/computed', debug.landroid.aree.vet[debug.landroid.aree.index]);
    publish('borderCut', data.enab_bordo === 1);*/

    /*

    await $objects.install(
      'sun',
      {
        role: 'value/sunposition',
        can: { read: false, write: false, trigger: true },
      },
      CreateObjectMode.create
    )*/

    /*  sub.add(
      $states
        .observe('/$set/+/state')
        .pipe(
          switchMap(msg => {
            const [scriptName] = msg.match.params
            $log.debug(`Setting state of ${scriptName} to ${msg.val}`)

            const storedScript = scripts.get(
              MqttUtil.join($args.name, scriptName)
            )

            return of(storedScript).pipe(
              mergeMap(aScript => {
                if (aScript) {
                  if (msg.val === true) {
                    return aScript.compile().then(() => aScript.start())
                  } else {
                    return aScript.stop()
                  }
                } else {
                  throw new Ha4usError(
                    404,
                    `script ${scriptName} does not exists`
                  )
                }
              }),
              catchError(e => {
                $log.error(
                  `Error setting state of ${scriptName} to ${msg.val} because ${
                    e.message
                  }`
                )
                return never()
              })
            )
          })
        )
        .subscribe(
          (script: Ha4usScript) => {
            $log.info(
              `script ${script.name} is ${
                script.running ? 'running' : 'stopped'
              }`
            )
          },
          e => {
            $log.error(`BUMMER`, e)
          },
          () => {
            $log.error('Script STATE Listener completed')
          }
        )
    )*/

    $states.connected = 2

    return true
  }

  async function $onDestroy() {}

  return {
    $onInit,
    $onDestroy,
  }
}

ha4us(ADAPTER_OPTIONS, Adapter)

/*function loadDir(dir) {
    async function destroyScript(name: string): Promise<Ha4usScript> {
      if (!scripts.has(name)) {
        throw new Ha4usError(404, `script ${name} does not exist`)
      }
      const script = scripts.get(name)
      $log.info('Stopping script', script.name)
      // run cleanup
      try {
        script.destroy()
      } catch (e) {
        $log.error('Probles cleaning up script', e)
        throw e
      } finally {
        scripts.delete(name)
      }

      return script
    }

    dir = path.resolve(dir)
    $log.debug('Loading dir', dir)
    const watch = chokidar.watch(dir + '/*.js')
    watch.on('ready', () => {
      $log.debug('Watching', watch.getWatched())
    })
    watch.on('add', (file: string, _?: fs.Stats) => {
      $log.info('Loading and Run script', file)
      installScript(new Ha4usScript(file), file)
    })
    watch.on('change', (file: string, _?: fs.Stats) => {
      $log.info('Script %s changed', file)
      //reloadScript(file)
    })
    watch.on('unlink', (file: string) => {
      $log.info('Script %s deleted', file)
      destroyScript(file)
    })
  }*/
