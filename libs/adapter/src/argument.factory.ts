import * as path from 'path'

import { Ha4usOptions } from './adapter'

export interface Ha4usArguments {
  _: string[]
  loglevel: string
  dbUrl: string
  mqttUrl: string
  name: string
  [prop: string]: any
}

export function ArgumentFactory($options: Ha4usOptions): Ha4usArguments {
  const pkg = require(path.resolve($options.path, './package.json'))
  const yargs = require('yargs')
    .usage(
      pkg.name +
        ' ' +
        pkg.version +
        '\n' +
        pkg.description +
        '\n\nUsage: $0 [$options]'
    )
    .describe('loglevel', 'possible values: "error", "warn", "info", "debug"')
    .describe('help', 'show help')
    .describe(
      'name',
      'instance name. used as mqtt client id and as prefix for connected topic'
    )
    .describe(
      'mqtt-url',
      'mqtt broker url. See https://github.com/mqttjs/MQTT.js#connect-using-a-url'
    )
    .describe(
      'maps',
      'a yml file containg mapping definitions for displaying values'
    )
    .alias({
      h: 'help',
      l: 'loglevel',
      m: 'mqtt-url',
      n: 'name',
    })
    .default({
      loglevel: 'info',
      'mqtt-url': 'mqtt://127.0.0.1',
      name: $options.name,
      maps: './maps.yml',
    })
    .env('HA4US')
    .version()
    .help('help')
  /*istanbul ignore else */
  if ($options.args) {
    const extendedArgs = {}
    Object.keys($options.args).forEach(key => {
      extendedArgs[$options.name + '-' + key] = $options.args[key]
    })
    yargs.options(extendedArgs)
    yargs.group(Object.keys(extendedArgs), $options.name)
  }

  yargs
    .describe('db-url', 'mongodb url')
    .group(['db-url'], 'Mongodb')
    .alias({
      d: 'db-url',
    })
    .default({
      'db-url': 'mongodb://127.0.0.1/ha4us',
    })

  /*istanbul ignore else */
  if ($options.imports.indexOf('$media') > -1) {
    yargs
      .describe('voicerss-apikey', 'API Key for voicerss')
      .group(['voicerss-apikey'], 'Media')
  }

  yargs.wrap(yargs.terminalWidth())
  return yargs.argv
}
