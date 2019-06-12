import {
  Subject,
  Subscription,
  from,
  of,
  never,
  NEVER,
  interval,
  timer,
} from 'rxjs'

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

import { Sandbox } from './sandbox.class'
import { Ha4usScript, ScriptEventType, LogEvent } from './ha4us-script'

import { Scheduler, SunTimes } from 'us-scheduler'

import * as path from 'path'
import * as fs from 'fs'
// import * as watch from 'watch';

import * as chokidar from 'chokidar'

const ADAPTER_OPTIONS = {
  // h,m,u,p,l,n
  name: 'scripts',
  path: __dirname + '/..',
  logo: 'scripts-logo.png',
  args: {
    dir: {
      alias: 'dir',
      demandOption: false,
      describe: 'directory of script files',
      type: 'string',
    },
    lat: {
      alias: 'lat',
      default: 54.46,
      demandOption: false,
      describe: 'Latitude for sun calculation',
      type: 'number',
    },
    long: {
      alias: 'long',
      default: 9.95,
      demandOption: false,
      describe: 'Longitutde for sun calculation',
      type: 'number',
    },
    watch: {
      alias: 'w',
      demandOption: false,
      default: true,
      describe: 'watch for script file changes',
      type: 'boolean',
    },
  },
  imports: [
    '$log',
    '$args',
    '$states',
    '$yaml',
    '$objects',
    // '$event',
    '$media',
  ],
}

function Adapter(
  $log,
  $args,
  $states: StateService,
  $yaml,
  $objects: ObjectService,
  $media: MediaService
  //  $event: EventService
) {
  const scripts = new Map<string, Ha4usScript>()

  interface Ha4usBuildObject extends Partial<Ha4usObject> {
    topic: string
  }

  const scriptEvent$ = new Subject<Ha4usScript>()
  let sub: Subscription

  function createScriptObjects(script: Ha4usScript) {
    $log.debug(`creating objects for ${script.name}`)

    return $objects
      .create(
        {
          state: {
            role: 'Value/Script/State',

            type: Ha4usObjectType.String,

            can: { trigger: true },
          },
          log: {
            role: 'Value/Script/Log',
            type: Ha4usObjectType.Object,
            can: { trigger: true },
          },
        },
        { root: MqttUtil.join('$', script.topic) }
      )
      .toPromise()
      .then(res => {
        $log.debug(
          `Topics ${res.objects.map(obj => obj.topic).join(',')} installed`
        )
        return script
      })
  }

  async function installScript(aScript: Ha4usScript): Promise<Ha4usScript> {
    if (scripts.has(aScript.name)) {
      throw new Ha4usError(409, `script "${aScript.name} "already exists`)
    }

    $log.debug(`creating script ${aScript.name}`)
    scripts.set(aScript.name, aScript)
    scriptEvent$.next(aScript)

    aScript.log$
      .pipe(
        mergeMap(event =>
          $states.status(MqttUtil.join(aScript.name, 'log'), event, true)
        )
      )
      .subscribe(
        msg => {
          $log.debug(`Message send`, msg.topic, msg.val)
        },
        e => $log.error('error in script event listener', e),
        () => $log.info('Script event listener completed')
      )

    aScript.status$
      .pipe(
        mergeMap(status =>
          $states.status(MqttUtil.join(aScript.name, 'state'), status, true)
        )
      )
      .subscribe(
        msg => {
          $log.debug(`Status update`, msg.topic, msg.val)
        },
        e => $log.error('error in script event listener', e),
        () => $log.info('Script event listener completed')
      )

    return aScript
      .init()
      .then(script => createScriptObjects(aScript))
      .then(script => script.compile())
      .then(script => {
        if (script && script.autostart) {
          return script.start()
        } else {
          return script
        }
      })
      .catch(e => {
        $log.error(`${aScript.name} errored`, e)
        return undefined
      })
  }

  async function $onInit() {
    await $objects.connect()
    await $media.connect()

    const res = await $objects
      .create(
        [
          {
            role: Ha4usRole.ScriptAdapter,
          },
          {
            sun: [
              {
                role: 'Device/Sun',
              },
              {
                position: {
                  role: 'Value/SunPosition',
                  type: Ha4usObjectType.Object,
                  can: { trigger: true },
                },
                time: {
                  role: 'Value/SunTime',
                  type: Ha4usObjectType.String,
                  can: { trigger: true },
                },
              },
            ],
          },
        ],
        { mode: 'update', root: '$' }
      )
      .toPromise()

    $log.info(`${res.updated} Objects updated. ${res.inserted} created`)

    // first loading script from database
    //
    $objects
      .observe(MqttUtil.join($args.name, '+'))
      .pipe(
        filter(script => script.role === 'Script'),
        mergeMap(scriptObject =>
          installScript(
            new Ha4usScript(scriptObject, {
              $args,
              $log,
              $yaml,
              $states,
              $objects,
              $media,
              //  $event,
            })
          )
        ),
        filter(script => !!script)
      )
      .subscribe(script => {
        $log.info('Loaded script from database', script.name)
      })

    // listen for object changes (insert, update, delete)
    sub = $states
      .observe('/$object/+')
      .pipe(
        filter(event => event.val.object.role === Ha4usRole.Script),
        switchMap(event => {
          const action = event.val.action
          const name = event.val.object.topic
          const script = scripts.get(event.val.object.topic)

          return of([action, name, script]).pipe(
            mergeMap(data => {
              $log.debug('script update arrived', event.val.action)
              switch (event.val.action) {
                case 'update':
                  if (!script) {
                    throw new Ha4usError(
                      409,
                      `script ${event.val.object.topic} does not exist`
                    )
                  }
                  script.source = event.val.object.native.source
                  script.autostart =
                    event.val.object.native.autostart ||
                    typeof event.val.object.native.autostart === 'undefined'
                  $log.debug(
                    'Setting new source with autostart',
                    event.val.object.native.autostart
                  )

                  return script.compile().then(() => script.restart())
                case 'insert':
                  if (script) {
                    throw new Ha4usError(
                      404,
                      `script ${event.val.object.topic} already exists`
                    )
                  }
                  return installScript(
                    new Ha4usScript(event.val.object, {
                      $args,
                      $log,
                      $yaml,
                      $states,
                      $objects,
                      $media,
                      // $event,
                    })
                  )
                case 'delete':
                  if (script) {
                    return script.stop().then(stoppedScript => {
                      scripts.delete(stoppedScript.name)
                      return stoppedScript
                    })
                  } else {
                    throw new Ha4usError(
                      404,
                      `script ${event.val.object.topic} already exists`
                    )
                  }

                default:
                  throw new Ha4usError(
                    405,
                    `method ${event.val.action} not known`
                  )
              }
            }),
            catchError(e => {
              $log.error(`action errored: ${e.message}`)
              return NEVER
            })
          )
        })
      )
      .subscribe(script => {
        $log.info(`action for script ${script.name} success`)
      })

    sub.add(
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
                return NEVER
              })
            )
          })
        )
        .subscribe(
          (script: Ha4usScript) => {
            $log.info(`script ${script.name} is ${script.status}`)
          },
          e => {
            $log.error(`BUMMER`, e)
          },
          () => {
            $log.error('Script STATE Listener completed')
          }
        )
    )

    if (!$args.scriptsDir) {
      throw new Error('No script directory given')
    }

    const st = new SunTimes({
      latitude: $args.lat,
      longitude: $args.long,
    })
    sub.add(
      timer(0, 300000)
        .pipe(map(() => st.sun))
        .subscribe(position => {
          $log.debug(
            `Sunposition calculated altitude ${position.altitude}°, azimuth: ${
              position.azimuth
            }° `
          )
          $states.status('$sun/position', position, true)
        })
    )

    const scheduler = new Scheduler({
      latitude: $args.lat,
      longitude: $args.long,
      skipPast: false, // also emit the past event to get the most recent one
    })
    sub.add(
      scheduler.schedule().subscribe(event => {
        $log.debug('SunTime', event.label, event.target.toISO())
        $states.status('$sun/time', event.label, true)
      })
    )

    $states.status('$sun/all', st.sortedTimes, true)

    $states.connected = 2

    return true
  }

  async function $onDestroy() {
    $log.info('Destroying scripts', scripts.keys())

    await from(scripts.values())
      .pipe(
        mergeMap(script => script.stop()),
        map(() => sub.unsubscribe()),

        toArray(),
        delay(2000) // waiting for 2 seconds to let all state emissions finish
      )
      .toPromise()
  }

  return {
    $onInit,
    $onDestroy,
  }
}

ha4us(ADAPTER_OPTIONS, Adapter).catch(e => {
  console.error('Error occurred', e)
  process.exit(1)
})
