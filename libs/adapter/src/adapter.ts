import { StateService } from './state.service'
import { ObjectService, CreateObjectMode } from './object.service'
// Create the container and set the resolutionMode to PROXY (which is also the default).
import { createHa4usContainer, destroyContainer } from './lib/container.factory'

import { Ha4usLogger, MqttUtil, union } from '@ha4us/core'

import { of, empty, EMPTY } from 'rxjs'
import { mergeMap, tap } from 'rxjs/operators'

import * as readPkgUp from 'read-pkg-up'

export interface Ha4usOptions {
  name: string
  path: string
  args: object
  ha4usVersion?: string
  version?: string
  imports?: string[]
}

export interface Ha4usAdapter {
  $onDestroy?: () => Promise<void>
  $onInit: () => Promise<boolean>
}
export type AdapterFactory = (...args: any[]) => Ha4usAdapter

export async function ha4us(options: Ha4usOptions, adapter: AdapterFactory) {
  process.title = 'ha4us-' + options.name

  options.imports = options.imports || []
  options.imports = union(options.imports, ['$log', '$args'])
  const container = await createHa4usContainer(options)
  const $log = container.resolve('$log') as Ha4usLogger

  let pckInfo = await readPkgUp({ cwd: options.path })

  options.version = pckInfo.pkg.version

  $log.info(`Ha4us - Adapter ${options.name} v${options.version}...`)

  pckInfo = await readPkgUp({ cwd: __dirname })
  options.ha4usVersion = pckInfo.pkg.version
  $log.info('Using ha4us v%s', options.ha4usVersion)

  container.registerFactory('$adapter', adapter)

  let $states: StateService
  try {
    $states = container.resolve('$states')
    await $states.connect()
    await $states.status(
      '$info',
      {
        adapter: options.name,
        version: options.version,
        ha4us: options.ha4usVersion,
        status: 'started',
      },
      true
    )
  } catch (e) {
    container.registerValue('$states', undefined)
    $log.warn('No connection to mqtt - please import the $state adapter')
  }

  if (options.imports.indexOf('$objects') > -1) {
    const $objects: ObjectService = container.resolve('$objects')
    $log.info('ObjectService available... connecting...')

    await $objects.connect()

    $log.debug(`ObjectService connected`)

    await $objects.install(
      null,
      { role: MqttUtil.join('adapter', options.name) },
      CreateObjectMode.create
    )
    $objects.events$
      .pipe(
        mergeMap(ev => {
          $log.silly('ObjectEvent', ev)
          return $states.publish(MqttUtil.resolve(ev.object.topic, 'object'), {
            action: ev.action,
            sender: options.name,
            object: ev.object,
          })
        })
      )
      .subscribe(() => {})
  }

  const $adapter: Ha4usAdapter = container.resolve('$adapter')

  async function gracefulStop(): Promise<void> {
    return of(undefined)
      .pipe(
        tap(() => {
          $log.info(`Stopping ${options.name} adapter`)
        }),
        mergeMap(() =>
          $states
            ? $states.status(
                '$info',
                {
                  adapter: options.name,
                  version: options.version,
                  ha4us: options.ha4usVersion,
                  status: 'stopped',
                },
                true
              )
            : EMPTY
        ),
        mergeMap(() => {
          if ($adapter.$onDestroy) {
            return $adapter.$onDestroy()
          }
        }),
        mergeMap(() => ($states ? $states.disconnect() : null))
      )
      .toPromise()
      .then(() => {
        destroyContainer()
        $log.info(`Adapter ${options.name} stopped gracefully.`)
      })
  }

  process.on('SIGINT', async () => {
    await gracefulStop()
      .catch(e => {
        $log.error(`Emergency exit`, e)
        process.exit(1)
      })
      .then(() => {
        process.exit(0)
      })
  })

  $log.info(`Starting adapter ${options.name}`)

  if ($adapter.$onInit) {
    return $adapter
      .$onInit()
      .then(result => {
        if (!result) {
          return gracefulStop()
        } else {
          $log.info(`Adapter ${options.name} started.`)
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
