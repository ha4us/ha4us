/**
 * @module Scripting Environment
 *
 * This is a doc comment for a dynamic module.
 * typedoc src/sandbox.interface.ts --out build/docs
 * --ignoreCompilerErrors --excludePrivate --excludeProtected
 * --mode modules --entrypoint "Scripting"
 */

import { Observable } from 'rxjs'
import { Ha4usMessage } from 'ha4us/core/types'
import { ScheduleEvent, SimpleTime, SchedulingOptions } from 'us-scheduler'
/**
 * Logger interface
 */
export interface Logger {
  /**
   * outputs a debug log statement in the log file
   * @param  ...args
   */
  debug(...args: any[]): void
  /**
   * outputs a error log statement in the log file
   * @param   ...args
   */
  info(...args: any[]): void
  /**
   * outputs a info log statement in the log file
   * @param   ...args
   */
  warn(...args: any[]): void
  /**
   * outputs a error log statement in the log file
   * @param   ...args
   */
  error(...args: any[]): void
}

/**
 * This is the scripting environment for scripts developed for
 * ha4us-scripts.
 *
 */
export interface Ha4usScriptingEnvironment {
  log: Logger
  console: Logger

  onlyRetained
  noRetained
  pick
  pickEach

  /**
   * Observes one or more MQTT topic
   * @param   ...topics the mqtt topics to subscribe
   * @return           stream of messages
   */
  observe(...topics: string[]): Observable<Ha4usMessage>

  /**
   * requires a  module
   * @param   md name of module to require
   * @return    the exported module
   */
  require(md: string): any

  observe(topic: string, ...params: any[]): Observable<Ha4usMessage>

  combine(...pattern: string[]): Observable<Ha4usMessage[]>

  set(topic: string, value: any): Promise<any>

  get(topic: string): Promise<any>

  status(topic: string, value: any, retained: boolean): void

  schedule(
    eventOrOpts: SimpleTime | SchedulingOptions,
    ...times: SimpleTime[]
  ): Observable<ScheduleEvent>

  doIn(duration: string | number): Observable<ScheduleEvent>

  load(file: string): Promise<any>
  save(data: any, file: string): Promise<void>

  $onDestroy(destroyFunc: () => void)
}
