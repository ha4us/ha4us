'use strict'

import { Ha4usRole, Ha4usError, Ha4usLogger } from '@ha4us/core'
import {
  ha4us,
  CreateObjectMode,
  DBMediaService,
  UserService,
  MediaService,
  ObjectService,
  YamlService,
  StateService,
  Ha4usArguments,
} from '@ha4us/adapter'
import { WebService } from './web.service'

import { asFunction } from 'awilix'
import * as glob from 'globby'
import * as path from 'path'

import * as express from 'express'

import { createHash } from 'crypto'

const ADAPTER_OPTIONS = {
  name: 'rest',
  path: __dirname + '/..',
  logo: 'logo/rest-logo.png',
  args: {
    port: {
      demandOption: false,
      default: 8081,
      describe: 'listening port',
      type: 'number',
    },
    config: {
      demandOption: false,
      alias: 'c',
      default: './config',
      describe: 'directory to store config data',
      type: 'string',
    },
    public: {
      demandOption: false,
      default: './public',
      describe: 'directory to store public assets',
      type: 'string',
    },
    adminpw: {
      alias: 'adminpw',
      demandOption: false,
      describe:
        'admin password (user admin) - if given the user entry for admin is recreated',
      type: 'string',
    },
    secret: {
      alias: 'secret',
      demandOption: true,
      describe: 'the secret for the token generation',
      type: 'string',
    },
  },
  imports: ['$states', '$injector', '$users', '$yaml', '$objects', '$media'],
}

function Adapter(
  $args: Ha4usArguments,
  $states: StateService,
  $injector,
  $yaml: YamlService,
  $log: Ha4usLogger,
  $users: UserService,
  $objects: ObjectService,
  $media: MediaService
) {
  let $web: WebService
  async function $onInit() {
    $web = new WebService($users, $log, $args)

    const cradle = {
      $args,
      $states,
      $injector,
      $yaml,
      $log,
      $users,
      $web,
      $objects,
      $media,
    }

    await $users.connect()

    // create admin user if not existing or

    $users
      .post({
        username: 'admin',
        password: $args.adminpw || $args.secret,
        fullName: 'Administrator',
        roles: ['admin'],
      })
      .then(() => {
        $log.info('Admin user created')
      })
      .catch((err: Ha4usError) => {
        if (err.code !== 409) {
          throw err
        }
      })

    const files = await glob('**/*.@(ts|js)', { cwd: __dirname + '/routes' })
    $log.debug('Found %d routes', files.length, __dirname + '/routes')
    files.forEach((file: string) => {
      const routePath = file.slice(0, -3)
      $log.debug('Loading route', routePath)

      const handler = require(path.resolve(__dirname, 'routes', file))

      const route = $web.createRoute()
      handler(route, cradle)
      $web.api.use('/' + routePath, route)
    })

    $log.info('Registering root url at %s', $args.restPublic)
    $web.app.use('/', express.static(path.resolve($args.restPublic)))
    $web.app.use((_, response) => {
      response.sendFile(path.resolve($args.restPublic, 'index.html'))
    })

    $log.debug('Start listening at port', $args.restPort)
    $web
      .listen($args.restPort)
      .subscribe(
        data => $log.debug(`WebListener is ${data.event}`),
        data => $log.debug('Weblistener Error', data),
        () => $log.debug('complete')
      )
    $states.connected = 2

    return true
  }

  async function $onDestroy() {
    $log.info('Destroying REST')
  }

  return {
    $onInit,
    $onDestroy,
  }
}

ha4us(ADAPTER_OPTIONS, Adapter).catch(e => {
  console.error('Abnormal exit', e)
})
