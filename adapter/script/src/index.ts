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
import { Ha4usScript, ScriptEventType } from './ha4us-script'

import { schedule, SunTimes } from 'us-scheduler'

import * as path from 'path'
import * as fs from 'fs'
// import * as watch from 'watch';

import * as chokidar from 'chokidar'

const ADAPTER_OPTIONS = {
  // h,m,u,p,l,n
  name: 'scripts',
  path: __dirname + '/..',
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

  const scriptEvent$ = new Subject<Ha4usScript>()
  let sub: Subscription

  function createScriptObjects(script: Ha4usScript) {
    $log.debug(`creating objects for ${script.name}`)

    return $objects
      .install(
        MqttUtil.join(script.topic, 'state'),
        {},
        CreateObjectMode.create
      )
      .then(() =>
        $objects.install(
          MqttUtil.join(script.topic, 'error'),
          {},
          CreateObjectMode.create
        )
      )
      .then(() =>
        $objects.install(
          MqttUtil.join(script.topic, 'log'),
          {},
          CreateObjectMode.create
        )
      )
      .then(() => script)
  }

  async function installScript(aScript: Ha4usScript): Promise<Ha4usScript> {
    if (scripts.has(aScript.name)) {
      throw new Ha4usError(409, `script "${aScript.name} "already exists`)
    }

    $log.debug(`creating script ${aScript.name}`)
    scripts.set(aScript.name, aScript)
    scriptEvent$.next(aScript)

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

    await $objects.install(
      null,
      { role: Ha4usRole.ScriptAdapter },
      CreateObjectMode.create
    )

    await $objects.install(
      'sun',
      {
        role: 'value/sunposition',
        type: Ha4usObjectType.Object,
        can: { read: false, write: false, trigger: true },
      },
      CreateObjectMode.create
    )

    // first loading script from database
    //
    $objects
      .observe({
        pattern: MqttUtil.join($args.name, '#'),
        role: Ha4usRole.Script,
      })
      .pipe(
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
          $log.debug('Sunposition', position)
          $states.status('$sun', position, true)
        })
    )

    sub.add(
      scriptEvent$.pipe(mergeMap(script => script.event$)).subscribe(
        async data => {
          await $states.status(
            MqttUtil.join(data.name, data.type),
            data.data,
            true
          )
        },
        e => $log.error('error in script event listener', e),
        () => $log.info('Script event listener completed')
      )
    )

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
