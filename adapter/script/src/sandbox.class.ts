/**
 * @module Scripting Environment
 *
 */
import * as path from 'path'
import * as fs from 'fs'

import {
  StateService,
  YamlService,
  ObjectService,
  CreateObjectMode,
  DBMediaService,
  MediaService,
  // EventService,
} from '@ha4us/adapter'

import { DateTime } from 'luxon'
import {
  ScheduleEvent,
  SunTimes,
  Scheduler,
  TimeDefinition,
  cron,
  CalculatedTime,
} from 'us-scheduler'

import {
  Ha4usOperators,
  Ha4usLogger,
  Ha4usMessage,
  MqttUtil,
  Ha4usObject,
  render,
  compile,
  randomString,
  Ha4usMedia,
  Ha4usMediaDefinition,
} from '@ha4us/core'

import * as rxjs from 'rxjs'
import { Observable } from 'rxjs'
import * as rxjsoperators from 'rxjs/operators'

import * as got from 'got'
import * as cheerio from 'cheerio'

import { Logger, transports } from 'winston'
import * as winston from 'winston'

import { Settings } from 'luxon'

import { Ha4usScript, ScriptEventType } from './ha4us-script'

export class Sandbox {
  stop$ = new rxjs.Subject<void>()
  protected _log: Ha4usLogger

  public _onDestroy: () => void

  public onlyRetained = Ha4usOperators.onlyRetained
  public noRetained = Ha4usOperators.noRetained
  public pick = Ha4usOperators.pick
  public pickEach = Ha4usOperators.pickEach
  public render = render
  public compileTemplate = compile
  public randomString = randomString

  protected _modules: {
    [moduleName: string]: any;
  } = { path, fs, rxjs, 'rxjs/operators': rxjsoperators }

  protected _name: string

  protected _$states: StateService
  protected _$yaml: YamlService
  protected _$objects: ObjectService
  protected $media: MediaService

  http = {
    parse: (url: string, query: object) => {
      return got
        .get(url, { query })
        .then(response => cheerio.load(response.body))
    },
    get: (url: string, query: object) => {
      return got.get(url, { query }).then(response => response.body)
    },
  }

  public console = {
    log: (message: string, ...args: any[]) => {
      this._script.log('debug', message, args)
      // this._script.domain.bind(this._log.debug)(...args)
    },
    debug: (message: string, ...args: any[]) => {
      this._script.log('debug', message, args)
      // this._script.domain.bind(this._log.debug)(...args)
    },
    info: (message: string, ...args: any[]) => {
      this._script.log('info', message, args)
      // this._script.domain.bind(this._log.debug)(...args)
    },
    warn: (message: string, ...args: any[]) => {
      this._script.log('warn', message, args)
      // this._script.domain.bind(this._log.debug)(...args)
    },
    error: (message: string, ...args: any[]) => {
      this._script.log('error', message, args)
      // this._script.domain.bind(this._log.debug)(...args)
    },
  }

  public log = this.console

  protected _scheduler: Scheduler

  constructor(protected _script: Ha4usScript) {
    this._log = this._setupLogger()
    Settings.defaultLocale = 'de'
    this._$states = _script.opts.$states
    this._$objects = _script.opts.$objects
    this._$yaml = _script.opts.$yaml
    this.$media = _script.opts.$media
    this._scheduler = new Scheduler({
      latitude: _script.opts.$args.lat,
      longitude: _script.opts.$args.long,
      skipPast: true,
    })
  }

  get sandbox(): Sandbox {
    const resultingSandbox: any = {}
    Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(
        key =>
          key !== 'sandbox' && key !== 'constructor' && key.charAt(0) !== '_'
      )
      .forEach(prop => (resultingSandbox[prop] = this[prop].bind(this)))

    Object.getOwnPropertyNames(this)
      .filter(key => key.charAt(0) !== '_')
      .forEach(prop => (resultingSandbox[prop] = this[prop]))

    resultingSandbox.__dirname = this._script.path
    resultingSandbox.DateTime = DateTime
    return resultingSandbox
  }

  protected _setupLogger(): Ha4usLogger {
    const logPath = path.resolve(
      this._script.path,
      this._script.name.replace('/', '_') + '.log'
    )
    /*const myFormat = format.printf(info => {
      return `${info.timestamp} ${info.level}: ${info.message}`
    })*/

    return new winston.Logger({
      transports: [
        /* new winston.transports.Console({
          json: false,
          level: 'debug',
          colorize: false,
          prettyPrint: true,
          stderrLevels: ['error', 'warn'],
          timestamp: true,
        }),*/
        new winston.transports.File({
          filename: logPath,
          json: false,
          level: 'debug',
          colorize: false,
          prettyPrint: true,
          stderrLevels: ['error', 'warn'],
          timestamp: true,
        }),
      ],
    })

    /*   winston.configure({
      transports: [
        new transports.File({
        }),
      ],
    })*/
  }

  public require(md: string): any {
    this._log.debug('requiring', md)
    if (this._modules.hasOwnProperty(md)) {
      return this._modules[md]
    }

    let tmp
    if (md.match(/^\.\//) || md.match(/^\.\.\//)) {
      tmp = './' + path.relative(__dirname, path.join(this._script.path, md))
    } else {
      tmp = md
      this._log.debug(
        'Looking in',
        path.join(this._script.path, 'node_modules', md, 'package.json')
      )
      if (
        fs.existsSync(
          path.join(this._script.path, 'node_modules', md, 'package.json')
        )
      ) {
        // must be in node_modules of scriptDir

        tmp = path.resolve(path.join(this._script.path, 'node_modules', md))
        this._log.debug('Requiring from node_modules in scriptdir', md)
      }
    }
    this._log.debug('Finally requiring', path.resolve(tmp))
    this._modules[md] = require(tmp)
    return this._modules[md]
  }

  public observe(topic: string, ...params: any[]) {
    this._script.enterDomain()
    return this._script.opts.$states
      .observe(topic, ...params)
      .pipe(rxjsoperators.takeUntil(this.stop$))
  }

  public combine(...pattern: string[]): Observable<Ha4usMessage[]> {
    return this._script.opts.$states
      .observeLatest(...pattern)
      .pipe(rxjsoperators.takeUntil(this.stop$))
  }

  public set(topic: string, value: any) {
    return this._$states.set(topic, value)
  }

  public get(topic: string): Promise<Ha4usMessage> {
    return this._$states.get(topic)
  }
  public status(topic: string, value: any, retained = true) {
    return this._$states.status(
      MqttUtil.join(this._script.name, topic),
      value,
      retained
    )
  }

  public emit(topic: string, value: any, retained = true) {
    return this._$states.status(
      MqttUtil.join(this._script.name, topic),
      value,
      retained
    )
  }

  public schedule(...times: TimeDefinition<any>[]): Observable<ScheduleEvent> {
    this._script.enterDomain()
    return this._scheduler
      .schedule(...times)
      .pipe(rxjsoperators.takeUntil(this.stop$))
  }

  public cron(cronPattern: string): Observable<DateTime> {
    return cron(cronPattern, DateTime.local()).pipe(
      rxjsoperators.takeUntil(this.stop$)
    )
  }

  public doIn<T>(duration: string | number, data?: T): Observable<T> {
    this._script.enterDomain()
    return this._scheduler
      .in(duration, data)
      .pipe(rxjsoperators.takeUntil(this.stop$))
  }

  public doAt<T>(date: TimeDefinition<any>): Observable<CalculatedTime<any>> {
    this._script.enterDomain()

    return this._scheduler.at(date).pipe(rxjsoperators.takeUntil(this.stop$))
  }

  public load(file: string): any {
    return this._$yaml.load(file, this._script.path)
  }
  public save(data: any, file: string): any {
    return this._$yaml.save(data, file, {
      filePath: this._script.path,
    })
  }

  public createObject(topic: string, data: Partial<Ha4usObject>): Promise<any> {
    return this._$objects
      .create([data, {}], {
        root: MqttUtil.join('$', this._script.topic, topic),
        mode: 'update',
      })
      .toPromise()
  }

  public $onDestroy(destroyFunc: () => void) {
    this._onDestroy = destroyFunc
  }

  random(maxOrMin: number, max?: number): number {
    if (!max) {
      max = maxOrMin
      maxOrMin = 0
    }

    return Math.floor(Math.random() * (max - maxOrMin + 1)) + maxOrMin
  }

  downloadImage(
    url: string,
    fileOptions: Partial<Ha4usMediaDefinition>
  ): Promise<string> {
    return this.$media.postUrl(url, fileOptions).then(data => data.urn)
  }

  event(msg: string, opt: any) {
    // this.$event
  }
}
