import * as vm from 'vm'
import * as domain from 'domain'
import * as fs from 'fs'
import * as path from 'path'

import { Subject, timer } from 'rxjs'

import { transform } from '@babel/core'

import {
  Ha4usObject,
  MqttUtil,
  Ha4usError,
  Ha4usRole,
  Ha4usLogger,
} from '@ha4us/core'

import {
  StateService,
  ObjectService,
  YamlService,
  Ha4usArguments,
  MediaService,
  // EventService
} from '@ha4us/adapter'
import { Sandbox } from './sandbox.class'

export enum ScriptEventType {
  Error = 'error',
  Log = 'log',
  State = 'state',
}

export class ScriptEvent {
  constructor(
    public readonly name: string,
    public readonly type: ScriptEventType,
    public data?: any
  ) {}
}

export interface ScriptOptions {
  $args: Ha4usArguments
  $log: Ha4usLogger
  $yaml: YamlService
  $states: StateService
  $objects: ObjectService
  $media: MediaService
  // $event: EventService;
}

export class Ha4usScript {
  readonly name: string
  readonly topic: string
  readonly path: string

  autostart = false

  _source: string
  set source(val: string) {
    this._source = val
  }

  sandbox: Sandbox
  domain: domain.Domain
  script: vm.Script
  result: any

  _running = false

  set running(val: boolean) {
    this._running = val
    this.emit(ScriptEventType.State, val)
  }

  get running(): boolean {
    return this._running
  }

  event$ = new Subject<ScriptEvent>()

  $log: Ha4usLogger

  constructor(scriptObject: Ha4usObject, public opts: ScriptOptions) {
    this.name = scriptObject.topic
    this.topic = MqttUtil.slice(this.name, 1)
    this.path = opts.$args.scriptsDir || process.cwd()

    this.$log = opts.$log
    this._source = scriptObject.native.source
    this.autostart =
      scriptObject.native.autostart ||
      typeof scriptObject.native.autostart === 'undefined'
  }

  prepareStack(e: Error, match: RegExp): string {
    const lines = e.stack.split('\n')

    const stack = []
    stack.push(e.message)
    for (const line of lines) {
      stack.push(line)
      if (line.match(match)) {
        // stack.splice(-1, 1)
        break
      }
    }

    return stack.join('\n')
  }

  async init(): Promise<Ha4usScript> {
    this.running = false
    this.sandbox = new Sandbox(this)

    this.domain = domain.create()
    this.enterDomain()
    this.$log.debug(`creating sandbox for ${this.name}`)

    this.domain.on('error', e => {
      this.$log.warn(`catched domain error ${e.message} in ${this.name}`)
      this.emit(ScriptEventType.Error, this.prepareStack(e, /domain:$/))
    })
    return this
  }

  protected async transpile(source: string): Promise<string> {
    return new Promise((resolve, reject) => {
      transform(
        source,
        {
          presets: [
            [
              '@babel/env',
              {
                targets: {
                  node: 'current',
                },
              },
            ],
          ],
        },
        (err, res) => {
          if (err) {
            reject(err)
          } else {
            this.$log.debug(`${this.name} transpiled`)
            resolve(res.code)
          }
        }
      )
    })
  }
  async compile(): Promise<Ha4usScript> {
    if (!this._source) {
      throw new Ha4usError(500, `source not available`)
    }

    try {
      const transpiled = await this.transpile(this._source)
      const extSource = `((async ()=>{${transpiled}})())`
      this.script = new vm.Script(extSource, {
        filename: this.name,
        timeout: 1000,
      })
      this.emit(ScriptEventType.Log, `script successfully compiled`)
      this.$log.debug(`${this.name} compiled`)
      return this
    } catch (e) {
      this.$log.warn(`compilation of ${this.name} failed ${e.message}`)
      this.running = false
      this.emit(
        ScriptEventType.Error,
        this.prepareStack(e, /at Ha4usScript.compile/)
      )
      throw e
    }
  }

  enterDomain() {
    if (process.domain !== this.domain) {
      this.$log.debug(`${this.name} entering script domain`)
      this.domain.enter()
    }
  }

  async start(): Promise<Ha4usScript> {
    if (this.running) {
      return this
    }
    if (!this.script) {
      throw new Ha4usError(500, `script is not compiled`)
    }
    this.$log.debug('Starting script')
    this.emit(ScriptEventType.Error, '')
    const context = vm.createContext(this.sandbox.sandbox)

    return this.script
      .runInContext(context)
      .then((val: any) => {
        this.result = val
        if (!this.sandbox._onDestroy) {
          this.emit(ScriptEventType.Log, `script has no $onDestroy function`)
        }
        this.emit(ScriptEventType.Log, `script finished with result ${val}`)

        this.running = true
        return this
      })
      .catch(e => {
        this.emit(
          ScriptEventType.Error,
          this.prepareStack(e, /at ContextifyScript.Script.runInContext/)
        )
        this.running = false
        throw new Ha4usError(500, 'error script execution', e)
      })
  }

  async stop(): Promise<Ha4usScript> {
    if (!this.running) {
      return this
    }
    this.$log.debug('Stopping script')

    this.sandbox.stop$.next()

    try {
      if (this.sandbox._onDestroy) {
        this.sandbox._onDestroy()
      }
    } catch (e) {
      this.emit(
        ScriptEventType.Error,
        this.prepareStack(e, /at ContextifyScript.Script.runInContext/)
      )
    } finally {
      this.running = false
      this.emit(ScriptEventType.Log, `script stopped`)
    }
    return this
  }

  async restart() {
    this.$log.debug('Restarting script')
    await this.stop()

    if (this.autostart === true) {
      await this.start()
    }

    return this
  }

  async destroy(): Promise<Ha4usScript> {
    await this.stop()
    this.emit(ScriptEventType.Log, `script destroyed`)
    this.event$.complete()
    if (this.domain) {
      this.domain.removeAllListeners()
      this.domain.exit()
    }
    return this
  }

  toHa4usObject(): Partial<Ha4usObject> {
    return {
      role: Ha4usRole.Script,
      native: {
        source: this._source,
      },
    }
  }

  emit(type: ScriptEventType, data?: any) {
    this.event$.next(new ScriptEvent(this.name, type, data))
  }
}
