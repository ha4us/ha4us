import { StateService } from './state.service'
import { ObjectService, CreateObjectMode } from './object.service'
// Create the container and set the resolutionMode to PROXY (which is also the default).
import {
  createHa4usContainer,
  destroyContainer,
} from './lib/container.factory'

import {
  Ha4usLogger,
  MqttUtil,
  union,
  Ha4usMedia,
  Ha4usObjectType,
  Ha4usObject,
} from '@ha4us/core'

import { of, empty, EMPTY, Subscription, interval } from 'rxjs'
import { mergeMap, tap, delay } from 'rxjs/operators'

import * as readPkgUp from 'read-pkg-up'
import { MediaService } from './media.service'

export interface Ha4usOptions {
  name: string
  path: string
  args: object
  logo?: string
  ha4usVersion?: string
  package?: string
  version?: string
  imports?: string[]
}

export interface Ha4usAdapter {
  $onDestroy?: () => Promise<void>
  $onInit: () => Promise<boolean>
}
export type AdapterFactory = (...args: any[]) => Ha4usAdapter

export async function ha4us(options: Ha4usOptions, adapter: AdapterFactory) {
  let sub: Subscription
  process.title = 'ha4us-' + options.name

  options.imports = options.imports || []
  options.imports = union(options.imports, ['$log', '$args'])
  const container = await createHa4usContainer(options)
  const $log = container.resolve('$log') as Ha4usLogger

  let pckInfo = await readPkgUp({ cwd: options.path })

  options.version = pckInfo.pkg.version
  options.package = pckInfo.pkg.name

  $log.info(`Ha4us - Adapter ${options.name} v${options.version}...`)

  pckInfo = await readPkgUp({ cwd: __dirname })
  options.ha4usVersion = pckInfo.pkg.version
  $log.info('Using ha4us v%s', options.ha4usVersion)

  container.registerFactory('$adapter', adapter)

  let $states: StateService
  try {
    $states = container.resolve('$states')
    await $states.connect()
  } catch (e) {
    container.registerValue('$states', undefined)
    $log.warn('No connection to mqtt - please import the $state adapter')
  }
  sub = interval(5000).subscribe(() => {
    const mem = process.memoryUsage()
    const rss = Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100
    $states.status('$state/memoryUsage', rss, true)
  })

  let logo: Ha4usMedia
  if (options.imports.indexOf('$media') > -1) {
    const $media: MediaService = container.resolve('$media')
    $log.info('MediaService available... connecting...')
    await $media.connect()
    const medias = await $media.import('assets/**/*', options.path)
    $log.info('%s of %s medias imported', medias.imported.length, medias.count)

    if (options.logo) {
      logo = await $media.getByFilename('assets/' + options.logo)
      $log.debug('Logo found', logo.filename)
    }
  }

  if (options.imports.indexOf('$objects') > -1) {
    const $objects: ObjectService = container.resolve('$objects')
    $log.info('ObjectService available... connecting...')

    await $objects.connect()

    $log.debug(`ObjectService connected`)

    const res = await $objects
      .create(
        [
          {
            role: MqttUtil.join('Adapter', options.name),
            image: logo ? logo.urn : undefined,
            native: {
              adapter: options.name,

              name: options.package,
            },
          },
          {
            state: [
              { role: 'Device/AdapterStatus' },
              {
                state: {
                  role: 'Value/Adapter/Status',
                  can: { trigger: true },
                  type: Ha4usObjectType.String,
                },
                lastError: {
                  role: 'Value/Adapter/Errory',
                  type: Ha4usObjectType.String,
                  can: { trigger: true },
                },
                memoryUsage: {
                  role: 'Value/Adapter/MemUsage',
                  type: Ha4usObjectType.Number,
                  can: { trigger: true },
                },
              },
            ],
          },
        ],
        {
          mode: 'create',
          root: '$',
        }
      )
      .toPromise()
    $log.info(`${res.inserted} adapter objects created`)

    await $objects
      .create(
        [
          {
            native: {
              version: options.version,
            },
          },
          {},
        ],
        {
          mode: 'update',
          root: '$',
        }
      )
      .toPromise()

    sub.add(
      $objects.events$
        .pipe(
          mergeMap(ev => {
            $log.silly('ObjectEvent', ev)
            return $states.publish(
              MqttUtil.resolve(ev.object.topic, 'object'),
              {
                action: ev.action,
                sender: options.name,
                object: ev.object,
              }
            )
          })
        )
        .subscribe(() => {})
    )
  }

  const $adapter: Ha4usAdapter = container.resolve('$adapter')

  async function gracefulStop(): Promise<void> {
    return of(undefined)
      .pipe(
        tap(() => {
          $log.info(`Stopping ${options.name} adapter`)
        }),
        mergeMap(() => {
          if ($adapter.$onDestroy) {
            return $adapter.$onDestroy()
          } else {
            return EMPTY
          }
        }),

        mergeMap(() => $states && $states.setState('stopped')),
        delay(500),
        mergeMap(() => ($states ? $states.disconnect() : null))
      )
      .toPromise()
      .then(() => {
        destroyContainer()
        $log.info(`Adapter ${options.name} stopped gracefully.`)
      })
  }

  let sigIntReceived = false
  process.on('SIGINT', () => {
    if (sigIntReceived) {
      return
    }
    sigIntReceived = true
    $log.debug('Received SIGINT')
    gracefulStop()
      .catch(e => {
        $log.error(`Emergency exit`, e)
        $states.state = 'error'
        process.exit(1)
      })
      .then(() => {
        $log.debug('Exit process')
        process.exit(0)
      })
  })

  $log.info(`Starting adapter ${options.name}`)

  if ($adapter.$onInit) {
    return $adapter
      .$onInit()
      .then(result => {
        if (!result) {
          $log.debug('Adapter closing without result')
          return gracefulStop()
        } else {
          $log.info(`Adapter ${options.name} started.`)
          $states.state = 'running'
        }
      })
      .catch(e => {
        $log.error('Uncatched Error occurred - trying graceful stop', e)
        return gracefulStop()
      })
  } else {
    return
  }
}
